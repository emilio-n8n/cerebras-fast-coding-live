import os
import base64
from dotenv import load_dotenv

load_dotenv()

def _decode(key: str) -> str:
    val = os.getenv(key, "")
    if not val:
        return ""
    try:
        return base64.b64decode(val).decode().strip()
    except Exception:
        return val

GEMINI_API_KEY = _decode("GEMINI_API_KEY_B64")
OPENROUTER_API_KEY = _decode("OPENROUTER_API_KEY_B64")

# Injecte dans l'environnement pour Claude Code (subprocess)
if GEMINI_API_KEY:
    os.environ["GEMINI_API_KEY"] = GEMINI_API_KEY
if OPENROUTER_API_KEY:
    os.environ["OPENROUTER_API_KEY"] = OPENROUTER_API_KEY
TARGET_PROJECT_DIR = os.getenv("TARGET_PROJECT_DIR", os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "target-project")))
CLAUDE_TIMEOUT = int(os.getenv("CLAUDE_TIMEOUT", "120"))
WS_PORT = int(os.getenv("WS_PORT", "8000"))
