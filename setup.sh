#!/usr/bin/env bash
set -e

echo "=== Installation du MVP Assistant Vocal ==="

# 1. .env
if [ ! -f .env ]; then
  cp .env.example .env
  echo ">>> Remplis tes clés API dans .env puis relance"
  exit 1
fi

# 2. Backend
echo "[1/3] Backend..."
cd backend && pip install -q -r requirements.txt && cd ..

# 3. Frontend
echo "[2/3] Frontend..."
cd frontend && npm install --silent && cd ..

# 4. Target
echo "[3/3] Projet cible..."
cd target-project && npm install --silent && cd ..

echo "=== Installation terminée ==="
echo ""
echo "Pour lancer :"
echo "  Terminal 1: cd backend   && uvicorn main:app --reload --port 8000"
echo "  Terminal 2: cd frontend  && npm run dev"
echo "  Terminal 3: cd target-project && npm run dev"
