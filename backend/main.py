import time
import asyncio
import logging
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from gemini_orchestrator import get_claude_command
from runner import execute_command

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("backend")

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
    logger.info("WebSocket connected")
    await websocket.send_json({"type": "status", "payload": "connected"})

    try:
        while True:
            data = await websocket.receive_text()
            logger.info("Received: %s", data[:120])
            start_time = time.time()

            await websocket.send_json({"type": "status", "payload": "thinking"})
            await websocket.send_json({"type": "message", "payload": f"[THINKING] Analyse en cours...", "timestamp": time.time()})

            try:
                command = await asyncio.wait_for(
                    get_claude_command(data),
                    timeout=30
                )
                logger.info("Gemini response: %s", command[:200])
            except asyncio.TimeoutError:
                logger.error("Gemini timed out after 30s")
                await websocket.send_json({"type": "error", "payload": "Gemini n'a pas répondu dans le temps imparti (30s)"})
                continue
            except Exception as e:
                logger.error("Gemini error: %s", str(e))
                await websocket.send_json({"type": "error", "payload": f"Erreur Gemini : {str(e)}"})
                continue

            await websocket.send_json({"type": "status", "payload": "running"})
            await websocket.send_json({
                "type": "command",
                "payload": command,
                "timestamp": time.time()
            })

            output_count = 0
            async for line in execute_command(command):
                output_count += 1
                await websocket.send_json({
                    "type": "output",
                    "payload": line,
                    "timestamp": time.time()
                })
            logger.info("Command finished, %d output lines", output_count)

            elapsed = round(time.time() - start_time, 2)
            await websocket.send_json({"type": "status", "payload": "done"})
            await websocket.send_json({
                "type": "done",
                "payload": f"Terminé en {elapsed}s",
                "elapsed": elapsed,
                "timestamp": time.time()
            })

    except Exception as e:
        logger.error("WebSocket error: %s", str(e))
        try:
            await websocket.send_json({"type": "error", "payload": f"Erreur serveur : {str(e)}"})
        except RuntimeError:
            pass
