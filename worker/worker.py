import runpod
import tempfile
import os
import requests

def handler(event):
    input_data = event.get("input", {})
    file_url = input_data.get("file_url")

    if not file_url:
        return {"error": "file_url is required"}

    with tempfile.TemporaryDirectory() as tmpdir:
        input_path = os.path.join(tmpdir, "input.pdf")
        output_path = os.path.join(tmpdir, "output.md")

        # تحميل الملف
        r = requests.get(file_url, timeout=120)
        if r.status_code != 200:
            return {"error": "failed to download file"}

        with open(input_path, "wb") as f:
            f.write(r.content)

        # تشغيل MinerU
        # ⚠️ الأمر قد يختلف حسب version
        cmd = f"mineru -i '{input_path}' -o '{output_path}'"
        exit_code = os.system(cmd)

        if exit_code != 0:
            return {"error": "mineru failed"}

        if not os.path.exists(output_path):
            return {"error": "no output generated"}

        with open(output_path, "r", encoding="utf-8", errors="ignore") as f:
            markdown = f.read()

        return {
            "markdown": markdown
        }

runpod.serverless.start({"handler": handler})
