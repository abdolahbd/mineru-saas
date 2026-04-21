#!/usr/bin/env bash
set -e

# يمكن تغييره إذا كنت تستعمل modelscope بدل huggingface
export MINERU_MODEL_SOURCE=${MINERU_MODEL_SOURCE:-huggingface}

# شغل mineru-api في الخلفية
mineru-api --host 0.0.0.0 --port 8000 &
API_PID=$!

echo "Waiting for mineru-api to become ready..."

# انتظر حتى يصبح الـ API جاهز
python - <<'PY'
import time
import requests
import sys

url = "http://127.0.0.1:8000/docs"

for _ in range(120):
    try:
        r = requests.get(url, timeout=2)
        if r.status_code == 200:
            print("mineru-api is ready")
            sys.exit(0)
    except Exception:
        pass
    time.sleep(2)

print("mineru-api did not become ready in time", file=sys.stderr)
sys.exit(1)
PY

# شغل worker ديال runpod
exec python /app/worker.py
