# Используем nginx для обслуживания статических файлов
FROM nginx:alpine

# Копируем готовую сборка React в nginx директорию
COPY build/ /usr/share/nginx/html/

# Создаем кастомную конфигурацию nginx для React Router
RUN echo 'server { \
    listen 3000; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    error_page 404 /index.html; \
}' > /etc/nginx/conf.d/default.conf

# Открываем порт 3000
EXPOSE 3000

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]
