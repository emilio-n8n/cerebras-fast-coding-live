#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

echo "=== Installation du MVP Assistant Vocal ==="

# 1. Backend
echo "[1/3] Backend..."
cd backend && pip install -q -r requirements.txt && cd ..

# 2. Frontend
echo "[2/3] Frontend..."
cd frontend && npm install --silent && cd ..

# 3. Target
echo "[3/3] Projet cible..."
cd target-project && npm install --silent && cd ..

echo "=== Installation terminée, lancement des services ==="

# Nettoyer les processus au Ctrl+C
cleanup() { kill 0; exit 0; }
trap cleanup SIGINT SIGTERM

# Lancer les 3 services en arrière-plan
(cd backend        && uvicorn main:app --reload --port 8000 --host 0.0.0.0) &
(cd frontend       && npm run dev) &
(cd target-project && npm run dev) &

echo ""
echo "  Backend  → http://localhost:8000"
echo "  Frontend → http://localhost:3000"
echo "  Target   → http://localhost:3001"
echo ""
echo "Appuie sur Ctrl+C pour tout arrêter."
wait
