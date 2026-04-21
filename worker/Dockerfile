FROM nvidia/cuda:12.1.1-cudnn8-runtime-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# 📦 system deps
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    git \
    wget \
    curl \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    libgl1 \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# 🧠 python setup
RUN ln -s /usr/bin/python3 /usr/bin/python

# ⚡ torch compatible with CUDA 12.1
RUN pip install --no-cache-dir torch torchvision torchaudio \
    --index-url https://download.pytorch.org/whl/cu121

# 🚀 mineru full install (GPU)
RUN pip install --no-cache-dir "mineru[all]>=3.1.0"

# 🧠 optional but IMPORTANT (vLLM stability)
RUN pip install --no-cache-dir vllm==0.5.4

# 📁 copy files
COPY worker/worker.py ./worker.py
COPY worker/start.sh ./start.sh

RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]
