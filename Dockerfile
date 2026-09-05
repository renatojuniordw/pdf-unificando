# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# NEXT_PUBLIC_* são embutidos no bundle do cliente em tempo de build.
# Vêm do docker-compose (build args) ou ficam vazios e caem no fallback do código.
ARG NEXT_PUBLIC_GA_ID
ARG NEXT_PUBLIC_GTM_ID
ARG NEXT_PUBLIC_META_PIXEL_ID
ARG NEXT_PUBLIC_ADSENSE_ID
ARG NEXT_PUBLIC_PRIVACY_EMAIL
ENV NEXT_PUBLIC_GA_ID=${NEXT_PUBLIC_GA_ID} \
    NEXT_PUBLIC_GTM_ID=${NEXT_PUBLIC_GTM_ID} \
    NEXT_PUBLIC_META_PIXEL_ID=${NEXT_PUBLIC_META_PIXEL_ID} \
    NEXT_PUBLIC_ADSENSE_ID=${NEXT_PUBLIC_ADSENSE_ID} \
    NEXT_PUBLIC_PRIVACY_EMAIL=${NEXT_PUBLIC_PRIVACY_EMAIL}

RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Binários nativos
RUN apk add --no-cache \
  ghostscript \
  libreoffice \
  qpdf \
  poppler-utils \
  font-freefont \
  ttf-dejavu \
  ttf-liberation \
  bash

# Usuário não-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Diretórios mínimos de cache para ferramentas que resolvem fontes em runtime
RUN mkdir -p /home/appuser/.cache/fontconfig /home/appuser/.fontconfig && \
    chown -R appuser:appgroup /home/appuser

# Política de segurança para Ghostscript (mitigação de CVEs)
RUN mkdir -p /etc/Ghostscript && \
    echo '<?xml version="1.0" encoding="UTF-8"?> \
    <policyContext> \
      <policy domain="coder" rights="none" pattern="EPS" /> \
      <policy domain="coder" rights="none" pattern="PS" /> \
      <policy domain="coder" rights="none" pattern="EPI" /> \
      <policy domain="coder" rights="none" pattern="XPS" /> \
      <policy domain="path" rights="none" pattern="/etc/*" /> \
    </policyContext>' > /etc/Ghostscript/policy.xml

USER appuser

COPY --from=builder --chown=appuser:appgroup /app/.next/standalone ./
COPY --from=builder --chown=appuser:appgroup /app/.next/static ./.next/static
COPY --from=builder --chown=appuser:appgroup /app/public ./public

EXPOSE 11005
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=11005
ENV XDG_CACHE_HOME=/home/appuser/.cache

CMD ["node", "server.js"]
