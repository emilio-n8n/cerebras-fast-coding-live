import asyncio
from config import TARGET_PROJECT_DIR, CLAUDE_TIMEOUT

async def execute_command(command: str):
    process = await asyncio.create_subprocess_shell(
        command,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT,
        cwd=TARGET_PROJECT_DIR,
    )

    try:
        while True:
            try:
                line = await asyncio.wait_for(
                    process.stdout.readline(),
                    timeout=CLAUDE_TIMEOUT
                )
                if not line:
                    break
                yield line.decode(errors="replace").strip()
            except asyncio.TimeoutError:
                yield f"[TIMEOUT] La commande a dépassé la limite de {CLAUDE_TIMEOUT}s"
                break
    except Exception as e:
        yield f"[ERROR] {str(e)}"
    finally:
        if process.returncode is None:
            process.kill()
        await process.wait()
