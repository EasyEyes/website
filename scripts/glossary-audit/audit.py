#!/usr/bin/env python3
"""Generate the glossary usage report, then attach removal-history evidence."""
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent

if __name__ == "__main__":
    for script in ("glossary_run.py", "glossary_history.py"):
        subprocess.run([sys.executable, str(HERE / script)], check=True)
