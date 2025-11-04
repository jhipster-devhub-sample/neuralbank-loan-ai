# --- ETAPA 1: BUILD ---
FROM registry.redhat.io/ubi9/nodejs-20 AS builder
WORKDIR /app
USER root
RUN chown 1001:0 /app
USER 1001
COPY package.json package-lock.json ./
COPY . .
RUN npm ci
RUN npm run build

# --- ETAPA 2: SERVE (con Red Hat Apache/httpd) ---
FROM registry.redhat.io/ubi9/httpd-24

# --- INICIO: CORRECCIÓN DE SINTAXIS ---
# Era --from=builder, no --from-builder
COPY --from=builder /app/dist /var/www/html
# --- FIN: CORRECCIÓN DE SINTAXIS ---

RUN echo -e " \
    <Directory /var/www/html>\n \
        Options Indexes FollowSymLinks\n \
        AllowOverride None\n \
        Require all granted\n \
        FallbackResource /index.html\n \
    </Directory>\n \
" > /etc/httpd/conf.d/my-spa.conf

USER root
RUN chown -R 1001:0 /var/www/html /var/run/httpd
RUN find /var/www/html -type d -exec chmod 755 {} +
RUN find /var/www/html -type f -exec chmod 644 {} +

USER 1001