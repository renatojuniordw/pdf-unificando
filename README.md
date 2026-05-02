# PDF Unificando

Ferramentas de PDF gratuitas, sem cadastro e sem armazenamento de arquivos. Tudo processado no servidor e descartado imediatamente.

## Ferramentas disponíveis

| Ferramenta | Descrição |
|---|---|
| Comprimir PDF | Reduz o tamanho do PDF mantendo a qualidade |
| Juntar PDF | Une vários PDFs em um único arquivo, com reordenação |
| Dividir PDF | Extrai páginas ou intervalos de um PDF |
| Rodar PDF | Gira páginas em qualquer ângulo |
| Organizar PDF | Reordena ou exclui páginas com drag & drop |
| PDF para Word | Converte PDF em `.docx` editável |
| PDF para JPG | Converte páginas do PDF em imagens JPG |
| JPG para PDF | Une imagens JPG/PNG em um único PDF |

## Stack

- **Next.js 16** com App Router
- **pdf-lib** — manipulação de PDFs no servidor
- **pdfjs-dist** — renderização de preview no browser
- **Ghostscript / LibreOffice / qpdf / poppler** — processamento nativo (compressão, conversão Word, JPG)
- **Tailwind CSS 4** + **Framer Motion**
- **dnd-kit** — drag & drop para reordenar páginas/arquivos

## Rodando localmente

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

> Ghostscript, LibreOffice e poppler precisam estar instalados localmente para as ferramentas de compressão e conversão funcionarem. No macOS: `brew install ghostscript libreoffice poppler qpdf`.

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
cp .env.example .env.local
```

| Variável | Descrição | Padrão |
|---|---|---|
| `MAX_FILE_SIZE` | Tamanho máximo de upload em bytes | `52428800` (50 MB) |
| `MAX_CONCURRENT_JOBS` | Jobs processados em paralelo | `2` |
| `MAX_QUEUE_SIZE` | Fila máxima de processamento | `5` |
| `RETRY_AFTER_SECONDS` | Tempo de espera quando a fila está cheia | `30` |
| `NEXT_PUBLIC_GA_ID` | ID do Google Analytics (opcional) | — |
| `NEXT_PUBLIC_ADSENSE_ID` | ID do Google AdSense (opcional) | — |
| `GA_API_SECRET` | Secret para Measurement Protocol (opcional) | — |

As variáveis de analytics e AdSense são completamente opcionais — o projeto funciona sem elas.

## Deploy com Docker

```bash
# Build e subir
docker compose up -d --build
```

O `docker-compose.yml` espera uma rede externa chamada `nginx-proxy` (para uso com Nginx Proxy Manager ou Traefik). Se quiser expor diretamente, adicione `ports` ao serviço:

```yaml
ports:
  - "3000:3000"
```

O container já inclui Ghostscript, LibreOffice, qpdf e poppler — não é necessário instalar nada no host.

## Build de produção (sem Docker)

```bash
npm run build
npm start
```

## Privacidade

Nenhum arquivo enviado é armazenado em disco. O processamento usa `/tmp` em memória e os arquivos são descartados assim que o download é entregue.
