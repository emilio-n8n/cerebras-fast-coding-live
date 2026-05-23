#!/usr/bin/env bash

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Installation du MVP Assistant Vocal ==="

echo "[1/3] Backend..."
pip install -q -r "$ROOT_DIR/backend/requirements.txt"
if [ $? -ne 0 ]; then echo "ERREUR: pip install backend"; exit 1; fi

echo "[2/3] Frontend..."
cd "$ROOT_DIR/frontend" && npm install
if [ $? -ne 0 ]; then echo "ERREUR: npm install frontend"; exit 1; fi

echo "[3/3] Projet cible..."
cd "$ROOT_DIR/target-project" && npm install
if [ $? -ne 0 ]; then echo "ERREUR: npm install target"; exit 1; fi

echo "=== Installation terminée, lancement des services ==="

cleanup() { kill 0 2>/dev/null; exit 0; }
trap cleanup SIGINT SIGTERM

(cd "$ROOT_DIR/backend" && uvicorn main:app --reload --port 8000 --host 0.0.0.0) &
(cd "$ROOT_DIR/frontend" && npm run dev) &
(cd "$ROOT_DIR/target-project" && npm run dev) &

sleep 2

echo ""
echo "  Backend  → http://localhost:8000"
echo "  Frontend → http://localhost:3000"
echo "  Target   → http://localhost:3001"
echo ""
echo "Appuie sur Ctrl+C pour tout arrêter."
wait
