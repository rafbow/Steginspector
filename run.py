"""
StegInspector — Unified Launcher
Menjalankan Backend (FastAPI) + Frontend (Vite) dalam satu perintah.
"""
import subprocess
import sys
import os
import time
import threading
from pathlib import Path

# ──────────────────────────────────────────────
# Paths
# ──────────────────────────────────────────────
ROOT     = Path(__file__).parent.resolve()
BACKEND  = ROOT / "backend"
FRONTEND = ROOT / "frontend"

# ──────────────────────────────────────────────
# ANSI colors
# ──────────────────────────────────────────────
RESET  = "\033[0m"
BOLD   = "\033[1m"
CYAN   = "\033[96m"
GREEN  = "\033[92m"
YELLOW = "\033[93m"
RED    = "\033[91m"
DIM    = "\033[2m"
PURPLE = "\033[95m"

# Force UTF-8 output on Windows
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")


def banner():
    os.system("cls" if os.name == "nt" else "clear")
    # Enable ANSI on Windows 10+
    if os.name == "nt":
        os.system("color")
    print(f"""
{CYAN}{BOLD}
  ======================================================
    StegInspector - Digital Forensics Platform
    Image Steganography Analysis Tool
  ======================================================
{RESET}""")


def log(prefix, color, msg):
    print(f"  {color}{BOLD}[{prefix}]{RESET} {msg}", flush=True)


def stream_output(proc, prefix, color):
    """Baca output subprocess dan tampilkan dengan prefix berwarna."""
    for line in iter(proc.stdout.readline, b""):
        try:
            text = line.decode("utf-8", errors="replace").rstrip()
            if text:
                print(f"  {color}|{RESET} {text}", flush=True)
        except Exception:
            pass


def check_npm():
    try:
        subprocess.run(["npm", "--version"], capture_output=True, check=True, shell=(os.name == "nt"))
        return True
    except Exception:
        return False


def install_backend_deps():
    req = BACKEND / "requirements.txt"
    if not req.exists():
        log("WARN", YELLOW, "requirements.txt tidak ditemukan")
        return
    log("SETUP", CYAN, "Memeriksa Python dependencies...")
    try:
        result = subprocess.run(
            [sys.executable, "-m", "pip", "install", "-r", str(req), "-q"],
            cwd=str(BACKEND),
            capture_output=True,
            text=True,
        )
        if result.returncode == 0:
            log("SETUP", GREEN, "Python dependencies OK")
        else:
            log("WARN", YELLOW, f"pip warning: {result.stderr[:300]}")
    except Exception as e:
        log("WARN", YELLOW, f"Tidak bisa install deps: {e}")


def install_frontend_deps():
    nm = FRONTEND / "node_modules"
    if nm.exists():
        log("SETUP", GREEN, "node_modules sudah ada")
        return
    log("SETUP", CYAN, "Installing npm dependencies (harap tunggu)...")
    subprocess.run(
        ["npm", "install", "--silent"],
        cwd=str(FRONTEND),
        check=True,
        shell=(os.name == "nt"),
    )
    log("SETUP", GREEN, "npm dependencies OK")


def start_backend():
    log("BACKEND", PURPLE, "Starting FastAPI di http://localhost:8000 ...")
    env = os.environ.copy()
    env["PYTHONUNBUFFERED"] = "1"
    proc = subprocess.Popen(
        [
            sys.executable, "-m", "uvicorn", "main:app",
            "--reload",
            "--host", "0.0.0.0",
            "--port", "8000",
            "--log-level", "info",
        ],
        cwd=str(BACKEND),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        env=env,
    )
    return proc


def start_frontend():
    log("FRONTEND", CYAN, "Starting React (Vite) di http://localhost:5173 ...")
    proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=str(FRONTEND),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        shell=(os.name == "nt"),
    )
    return proc


def main():
    banner()

    # ── Pre-flight checks ───────────────────────────────────
    log("CHECK", CYAN, "Memeriksa environment...")

    if not check_npm():
        log("ERROR", RED, "npm tidak ditemukan! Install Node.js dari https://nodejs.org")
        input("\nTekan Enter untuk keluar...")
        sys.exit(1)

    log("CHECK", GREEN, f"Python OK -> {sys.executable}")
    log("CHECK", GREEN, "npm OK")
    print()

    # ── Install dependencies ────────────────────────────────
    install_backend_deps()
    install_frontend_deps()
    print()

    # ── Start services ──────────────────────────────────────
    print(f"  {DIM}{'='*54}{RESET}")
    backend_proc  = start_backend()
    time.sleep(2)
    frontend_proc = start_frontend()
    time.sleep(2)

    print()
    print(f"  {DIM}{'='*54}{RESET}")
    print(f"""
  {GREEN}{BOLD}Semua service berjalan!{RESET}

  {CYAN}  Frontend  ->  http://localhost:5173{RESET}
  {PURPLE}  Backend   ->  http://localhost:8000{RESET}
  {DIM}  API Docs  ->  http://localhost:8000/docs{RESET}

  {YELLOW}  Tekan Ctrl+C untuk menghentikan semua service{RESET}
  {DIM}{'='*54}{RESET}
""", flush=True)

    # ── Stream output di thread terpisah ────────────────────
    t1 = threading.Thread(target=stream_output, args=(backend_proc,  "API", PURPLE), daemon=True)
    t2 = threading.Thread(target=stream_output, args=(frontend_proc, "UI",  CYAN),   daemon=True)
    t1.start()
    t2.start()

    # ── Tunggu hingga Ctrl+C ────────────────────────────────
    try:
        while True:
            # Cek apakah salah satu proses mati
            if backend_proc.poll() is not None:
                log("ERROR", RED, "Backend berhenti tidak terduga! Cek log di atas.")
                break
            if frontend_proc.poll() is not None:
                log("ERROR", RED, "Frontend berhenti tidak terduga! Cek log di atas.")
                break
            time.sleep(1)
    except KeyboardInterrupt:
        pass
    finally:
        print(f"\n  {YELLOW}Menghentikan semua service...{RESET}")
        for proc in [backend_proc, frontend_proc]:
            try:
                proc.terminate()
                proc.wait(timeout=5)
            except Exception:
                try:
                    proc.kill()
                except Exception:
                    pass
        print(f"  {GREEN}Selesai. Sampai jumpa!{RESET}\n")


if __name__ == "__main__":
    main()
