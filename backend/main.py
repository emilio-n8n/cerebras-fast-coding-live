import time
import asyncio
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from gemini_orchestrator import get_claude_command
from runner import execute_command

app = FastAPI(title="Voice Coding Assistant MVP")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    await websocket.send_json({"type": "status", "payload": "connected"})

    try:
        while True:
            data = await websocket.receive_text()
            start_time = time.time()

            await websocket.send_json({"type": "status", "payload": "thinking"})
            await websocket.send_json({"type": "message", "payload": f"[THINKING] Analyse en cours...", "timestamp": time.time()})

            try:
                command = await asyncio.wait_for(get_claude_command(data), timeout=10)
            except asyncio.TimeoutError:
                await websocket.send_json({"type": "error", "payload": "Gemini n'a pas répondu dans le temps imparti (10s)"})
                continue
            except Exception as e:
                await websocket.send_json({"type": "error", "payload": f"Erreur Gemini : {str(e)}"})
                continue

            await websocket.send_json({"type": "status", "payload": "running"})
            await websocket.send_json({
                "type": "command",
                "payload": command,
                "timestamp": time.time()
            })

            async for line in execute_command(command):
                await websocket.send_json({
                    "type": "output",
                    "payload": line,
                    "timestamp": time.time()
                })

            elapsed = round(time.time() - start_time, 2)
            await websocket.send_json({"type": "status", "payload": "done"})
            await websocket.send_json({
                "type": "done",
                "payload": f"Terminé en {elapsed}s",
                "elapsed": elapsed,
                "timestamp": time.time()
            })

    except Exception as e:
        try:
            await websocket.send_json({"type": "error", "payload": f"Erreur serveur : {str(e)}"})
        except RuntimeError:
            pass
