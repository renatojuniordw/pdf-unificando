# Deploy — Docker, docker-compose e nginx

Guia de deploy do **Unificando PDF** em produção (`pdf.unificando.com.br`).

## Visão geral

```
Internet
  └─ nginx (container) — TLS, rate limit, client_max_body_size 55M
       └─ proxy → container app "unificando-pdf" (porta 11005, Next standalone server.js)
```

Três artefatos do deploy:

1. **`Dockerfile`** — imagem multi-stage com o app standalone
2. **`docker-compose.yml`** — orquestração (env, limites, healthcheck, hardening)
3. **`nginx/`** — configs de proxy reverso (http-context + vhost)

## Dockerfile (multi-stage)

```dockerfile
# Estágio 1: builder
FROM node:20-alpine ...
npm ci && npm run build

# Estágio 2: runner (enxuto)
- instala binários de sistema: ghostscript, libreoffice, qpdf, poppler-utils, fonts
- aplica política restritiva do Ghostscript (security policy)
- cria usuário não-root "appuser"
- copia .next/standalone (server.js), .next/static, public
CMD ["node", "server.js"]
```

Pontos importantes:

- `output: 'standalone'` (`next.config.ts`) gera `server.js` + dependências mínimas.
- Binários externos (Ghostscript, LibreOffice, pdftoppm) são **obrigatórios** para compressão, Word e conversão de imagens — não remova do runner.
- Nenhum segredo é gravado na imagem; env vars vêm do compose.

## docker-compose.yml

Serviço único `pdf-tools`:

| Item | Valor |
|---|---|
| Container | `unificando-pdf` |
| Porta | `127.0.0.1:11005:11005` (exposta só no host; nginx acessa) |
| Repetição | `restart: unless-stopped` |
| Env | `NODE_ENV`, `PORT` (11005), `MAX_FILE_SIZE`, `MAX_CONCURRENT_JOBS`, `MAX_QUEUE_SIZE`, `RETRY_AFTER_SECONDS`, `ALLOWED_ORIGIN`, `NEXT_PUBLIC_ADSENSE_ID`, `NEXT_PUBLIC_GA_ID`, `GA_API_SECRET` (as duas últimas são passadas pelo compose, mas o GA id está hardcoded no `layout.tsx` e `GA_API_SECRET` não é usada em `src/`) |
| Recursos | `cpus: '1.0'`, `memory: 1024M` |
| Hardening | `read_only: true`, `no-new-privileges: true`, `cap_drop: ALL` |
| Volumes tmpfs | `/tmp` (512m), `.next/cache`, caches de fontes |
| Healthcheck | `wget --spider http://localhost:11005/api/health` |
| Logs | json-file rotacionado |

**Importante**: `read_only: true` exige os tmpfs acima; qualquer escrita fora deles falha.

## nginx

Duas configs:

- **`nginx/http-context.conf`**: define a zona de rate limit `pdf_upload` (5 req/min por IP) e status 429 padrão.
- **`nginx/pdf.unificando.com.br.conf`**:
  - Redireciona HTTP → HTTPS (301)
  - Listen TLS (certificados Let's Encrypt)
  - `client_max_body_size 55M`
  - Headers de segurança (HSTS, X-Frame-Options, etc.)
  - `location /api/pdf/`: `limit_req zone=pdf_upload burst=3 nodelay`, proxy para `http://unificando-pdf:11005` com timeouts `proxy_connect_timeout 10s`, `proxy_read_timeout 120s`, `proxy_send_timeout 120s`
  - Demais rotas: proxy simples

## Passo a passo de deploy

1. **Build da imagem**: `docker compose build` (ou CI/CD se adicionado)
2. **Subir**: `docker compose up -d`
3. **Validar**: `curl http://localhost:11005/api/health` no host; depois o domínio público via HTTPS
4. **Atualização**: `git pull` → `docker compose build` → `docker compose up -d`
5. **Rollback**: imagem anterior (ex.: `docker compose up -d --no-build` após `docker image tag` do build anterior)

> Não há CI configurado (`.github/` ausente). O deploy é manual via docker compose na máquina de produção.

## Limites de upload — consistência obrigatória

Três mecanismos precisam permanecer alinhados. Se alterar um, altere os outros:

1. `client_max_body_size` no nginx (atual: **55M**)
2. `experimental.proxyClientMaxBodySize` no `next.config.ts` (atual: **55mb**) — o default de 10MB **trunca uploads** e quebra o `formData()` (bug já ocorrido)
3. `MAX_TOTAL_UPLOAD_BYTES` + `MAX_FILE_SIZE` em `src/lib/limits.ts` (atual: **50MB**) — deve ficar abaixo do proxy/nginx para a API responder JSON 413 antes do 413 HTML do nginx

## Troubleshooting

| Sintoma | Causa provável |
|---|---|
| Upload >50MB retorna 413 HTML | nginx `client_max_body_size` alcançado antes da app (esperado; app bloqueia em 50MB com JSON) |
| Upload >10MB retorna 500 "Failed to parse body as FormData" | `proxyClientMaxBodySize` voltou ao default (10MB) — re-aplique 55mb no build |
| Healthcheck falhando | Container sem tmpfs de `/tmp`? CPU/mem > limite? binários ausentes no runner? |
| Conversão Word/JPG falhando | LibreOffice/poppler não instalados no runner |
| 429 em rajada | Rate limit nginx (5r/m) — veja `Retry-After` e o limite interno do app |