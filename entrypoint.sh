#!/bin/sh
# Le volume Dokploy est monté en root : corriger les permissions
# pour que l'utilisateur "node" puisse écrire la base SQLite
mkdir -p /app/data
chown -R node:node /app/data
exec su-exec node node server.js
