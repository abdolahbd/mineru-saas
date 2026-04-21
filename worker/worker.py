import runpod
import tempfile
import os
import requests
import subprocess
import glob

def handler(event):
    input_data = event.get("input", {})
    file_url = input_data.get("file_url")

    if not file_url:
        return {"error": "file_url is required"}

    with tempfile.TemporaryDirectory() as tmpdir:
        input_path = os.path.join(tmpdir, "input.pdf")
        output_dir = os.path.join(tmpdir, "out")
        os.makedirs(output_dir, exist_ok=True)

        r = requests.get(file_url, timeout=120)
        r.raise_for_status()

        with open(input_path, "wb") as f:
            f.write(r.content)

        cmd = [
            "mineru",
            "-p", input_path,
            "-o", output_dir,
            "--backend", "hybrid-auto-engine"
        ]

        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode != 0:
            return {
                "error": "mineru failed",
                "stdout": result.stdout,
                "stderr": result.stderr
            }

        md_files = glob.glob(os.path.join(output_dir, "**", "*.md"), recursive=True)

        if not md_files:
            return {
                "error": "no markdown found",
                "stdout": result.stdout,
                "stderr": result.stderr,
                "files": list(glob.glob(os.path.join(output_dir, "**", "*"), recursive=True))
            }

        with open(md_files[0], "r", encoding="utf-8", errors="ignore") as f:
            markdown = f.read()

        return {
            "markdown": markdown[:4000]
        }

runpod.serverless.start({"handler": handler})
