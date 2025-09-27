# build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# run (SPA estático)
FROM node:18-alpine
WORKDIR /app
RUN npm i -g serve
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
EXPOSE 8080
CMD ["sh","-c","serve -s dist -l ${PORT:-8080}"]
