# ---------- Build ----------
FROM node:20-alpine AS build
WORKDIR /app

# Outils de build (au cas où better-sqlite3 doit compiler)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# ---------- Runtime ----------
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./
COPY server.js db.js db-defaults.js ./
COPY src ./src
COPY public ./public
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh

# La base SQLite vit dans /app/data — à monter en volume dans Dokploy
VOLUME /app/data

EXPOSE 3000

# L'entrypoint tourne en root le temps de corriger les permissions du volume,
# puis redescend en utilisateur "node" via su (BusyBox)
ENTRYPOINT ["./entrypoint.sh"]
