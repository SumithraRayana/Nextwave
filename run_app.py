"""
NxtWave AI Ready Campus Challenge - Unified Runner
Starts both the FastAPI backend (port 8000) and the Vite React frontend (port 5173).
"""

import subprocess
import sys
import os
import time

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    print("===============================================================")
    print(" 🚀 Starting NxtWave AI Ready Campus Challenge Growth Prototype ")
    print("===============================================================")
    print(" Backend:  http://127.0.0.1:8000 (FastAPI + SQLite)")
    print(" Frontend: http://127.0.0.1:5173 (React + Vite + Tailwind)")
    print(" Admin:    http://127.0.0.1:5173 -> Click 'Admin & Growth Funnel'")
    print(" Credentials: admin / admin123")
    print("===============================================================\n")

    # Start Backend
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000"],
        cwd=backend_dir
    )

    # Start Frontend
    # Use npx / npm depending on platform
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev", "--", "--host", "127.0.0.1", "--port", "5173"],
        cwd=frontend_dir
    )

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down servers...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Shutdown complete.")

if __name__ == "__main__":
    main()
