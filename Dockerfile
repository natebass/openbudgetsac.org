FROM node:21

WORKDIR /app

COPY _src/package*.json ./

RUN npm install

COPY _src .

RUN npm run build

EXPOSE 8011

CMD ["npx", "@11ty/eleventy", "--serve", "--port=8011"]