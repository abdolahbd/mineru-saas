#!/usr/bin/env bash
set -e

export MINERU_MODEL_SOURCE=huggingface
export CUDA_VISIBLE_DEVICES=0

echo "Starting mineru-api..."

mineru-api \
  --host 0.0.0.0 \
  --port 8000 \
  --gpu-memory-utilization 0.5 \
  --tensor-parallel-size 1 &
  
echo "Waiting for API..."

python - <<'PY'
import time, requests
for _ in range(120):
    try:
        if requests.get("http://127.0.0.1:8000/docs").status_code == 200:
            print("READY")
            break
    except:
        pass
    time.sleep(2)
PY

echo "Starting worker..."
exec python /app/worker.py
