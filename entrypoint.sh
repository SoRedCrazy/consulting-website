#!/bin/sh
# S'assurer que le volume de données est accessible par l'utilisateur node
mkdir -p /app/data
chown -R node:node /app/data 2>/dev/null || true
exec node server.js
