import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
TARGET_PROJECT_DIR = os.getenv("TARGET_PROJECT_DIR", os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "target-project")))
CLAUDE_TIMEOUT = int(os.getenv("CLAUDE_TIMEOUT", "120"))
WS_PORT = int(os.getenv("WS_PORT", "8000"))
