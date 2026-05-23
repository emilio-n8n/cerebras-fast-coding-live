import google.generativeai as genai
from config import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash-preview")

SYSTEM_PROMPT = """Tu es un orchestrateur de coding IA.
L'utilisateur décrit ce qu'il veut modifier dans son projet Next.js.
Tu dois retourner UNIQUEMENT une commande shell de ce format exact :
claude "description précise et technique de la tâche à effectuer"

Règles :
- Sois extrêmement précis sur les fichiers concernés et le chemin exact
- Inclus le framework (Next.js, Tailwind, TypeScript)
- Précise le type de modification (créer, modifier, supprimer)
- Pas d'explication, juste la commande
- Maximum 200 tokens"""

async def get_claude_command(user_input: str) -> str:
    import asyncio
    response = await asyncio.to_thread(
        model.generate_content,
        f"{SYSTEM_PROMPT}\n\nDemande utilisateur : {user_input}",
    )
    return response.text.strip()
