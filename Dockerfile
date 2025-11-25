FROM registry.redhat.io/ubi9/nodejs-20 AS builder
WORKDIR /app
USER root
RUN chown 1001:0 /app
USER 1001
COPY package.json package-lock.json ./
COPY . .
RUN npm ci
RUN npm run build

FROM registry.redhat.io/ubi9/httpd-24

COPY --from=builder /app/dist /var/www/html

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