# Variáveis de ambiente

Referência das variáveis de ambiente usadas pelo projeto. Nenhuma contém valor secreto aqui — ver `.env` local / gerenciador de segredos do deploy.

Fonte: grep de `process.env.*` em `src/` (arquivos de código) + `docker-compose.yml`.

| Variável | Onde é usada | Default | Finalidade |
|---|---|---|---|
| `NODE_ENV` | framework/runtime | `production` | Modo de execução do Next |
| `PORT` | docker-compose / server | `11005` | Porta do container Node (não lida via `process.env` no código; definida no compose) |
| `SITE_URL` | `src/lib/site.ts` | `https://pdf.unificando.com.br` | URL canônica do site (canonical, sitemap, JSON-LD) |
| `MAX_FILE_SIZE` | `src/lib/limits.ts` | `52428800` (50MB) | Tamanho máximo por arquivo (bytes) |
| `MAX_UPLOAD_FILES` | `src/lib/limits.ts` | `20` | Quantidade máxima de arquivos por requisição |
| `MAX_TOTAL_UPLOAD_BYTES` | `src/lib/limits.ts` | `52428800` (50MB) | Soma máxima dos arquivos por requisição (estático; veja nota) |
| `MAX_CONCURRENT_JOBS` | `src/lib/queue.ts` | `2` | Concorrência de jobs binários (Ghostscript, LibreOffice, pdftoppm) |
| `MAX_QUEUE_SIZE` | `src/lib/queue.ts` | `5` | Tamanho da fila de espera antes de tratar como sobrecarga |
| `RETRY_AFTER_SECONDS` | `src/lib/queue.ts` | `30` | Cabeçalho `Retry-After` quando o servidor está sobrecarregado |
| `ALLOWED_ORIGIN` | `src/proxy.ts` | — (deriva do Host) | Origem permitida para as rotas `/api/pdf/*`; se ausente, usa o `Host` da request |
| `API_SECRET_KEY` | `src/proxy.ts` | — | Se definida, exige `Authorization: Bearer <chave>` nas rotas `/api/pdf/*` |
| `NEXT_PUBLIC_ADSENSE_ID` | `src/app/layout.tsx:12` | `ca-pub-6897422992813570` | ID do Google AdSense (carregado no cliente) |
| `NEXT_PUBLIC_GA_ID` | — (passada via compose; **não lida no código**) | `G-WDL8Q73DPM` (hardcoded) | O ID do GA4 está hardcoded em `layout.tsx`/`analytics.ts`; a env existe no compose mas não é consumida em `src/` |
| `GA_API_SECRET` | — (passada via compose; **não usada no código atual**) | — | Reservada para reports do GA4 (Measurement Protocol); sem uso em `src/` hoje |

## Notas importantes

- **`MAX_TOTAL_UPLOAD_BYTES`** é **estático** (não lê env) porque é usado também no cliente (`checkUploadBatch`), que roda em build-time. Se você aumentar `MAX_FILE_SIZE`/limites no nginx, precisa alinhar este valor **e** o `experimental.proxyClientMaxBodySize` do `next.config.ts` e o `client_max_body_size` do nginx — os três precisam ser consistentes (total ≤ proxy ≤ nginx, com folga para overhead multipart).
- **`NEXT_PUBLIC_*`**: expostas ao navegador em build-time. Alterá-las exige rebuild.
- **`ALLOWED_ORIGIN`** e **`API_SECRET_KEY`**: proteção adicional no Proxy. O nginx já separa a origem; `ALLOWED_ORIGIN` é para outros cenários de deploy. `localhost` é sempre permitido (debug).
- **`.env` local** não está versionado. O `docker-compose.yml` referencia `ALLOWED_ORIGIN`, `NEXT_PUBLIC_GA_ID`, `GA_API_SECRET`, `NEXT_PUBLIC_ADSENSE_ID` a partir do ambiente/`.env` da máquina de deploy.

## Como configurar

Crie um arquivo `.env` na raiz (copie um `.env` de referência se necessário — não há `.env.example` versionado):

```bash
SITE_URL=https://pdf.unificando.com.br
MAX_FILE_SIZE=52428800
MAX_UPLOAD_FILES=20
MAX_CONCURRENT_JOBS=2
MAX_QUEUE_SIZE=5
RETRY_AFTER_SECONDS=30
ALLOWED_ORIGIN=https://pdf.unificando.com.br
NEXT_PUBLIC_GA_ID=G-XXXX
NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXX
```

> Sugestão de melhoria (fora do escopo da documentação): versionar um `.env.example` com esses nomes e comentários explicativos.