#!/bin/sh
# Le volume Dokploy est monté en root : corriger les permissions
# pour que l'utilisateur "node" puisse écrire la base SQLite
mkdir -p /app/data
chown -R node:node /app/data

# Redescendre en utilisateur "node" (su de BusyBox, présent sur Alpine)
exec su node -s /bin/sh -c "exec node server.js"
