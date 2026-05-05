# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
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

CMD ["node", "server.js"]
