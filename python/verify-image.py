import importlib
import subprocess
import sys


expected, *extra_imports = sys.argv[1:]
actual = f"{sys.version_info.major}.{sys.version_info.minor}"
if expected != "latest" and actual != expected:
    raise SystemExit(f"Expected Python {expected}, got {actual}")

subprocess.run([sys.executable, "-B", "-m", "pip", "check"], check=True)
for module in ("oss2", "httpx", "PIL", "pydantic", "redis", "requests", *extra_imports):
    importlib.import_module(module)
