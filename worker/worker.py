import os
import glob
import tempfile
import requests
import runpod

MINERU_API_URL = os.getenv("MINERU_API_URL", "http://127.0.0.1:8000")
MINERU_PARSE_ENDPOINT = f"{MINERU_API_URL}/file_parse"


def _download_file(file_url: str, dst_path: str) -> None:
    with requests.get(file_url, stream=True, timeout=300) as r:
        r.raise_for_status()
        with open(dst_path, "wb") as f:
            for chunk in r.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    f.write(chunk)


def _wait_for_api_ready() -> None:
    docs_url = f"{MINERU_API_URL}/docs"
    for _ in range(30):
        try:
            r = requests.get(docs_url, timeout=2)
            if r.status_code == 200:
                return
        except Exception:
            pass
    raise RuntimeError("mineru-api is not ready")


def _collect_markdown_from_output_dir(output_dir: str) -> str | None:
    md_files = glob.glob(os.path.join(output_dir, "**", "*.md"), recursive=True)
    if not md_files:
        return None

    # نختار أول ملف markdown
    md_path = md_files[0]
    with open(md_path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()


def _call_mineru_api(input_path: str, output_dir: str) -> dict:
    """
    نرسل الملف إلى mineru-api المحلي.
    كثير من أمثلة MinerU تعتمد POST /file_parse للتوافق الخلفي.
    """
    with open(input_path, "rb") as f:
        files = {
            "files": (os.path.basename(input_path), f, "application/pdf")
        }

        # بعض الإعدادات يمكن تمريرها كحقول form عند الحاجة
        data = {
            "output_dir": output_dir
        }

        response = requests.post(
            MINERU_PARSE_ENDPOINT,
            files=files,
            data=data,
            timeout=1800
        )

    response.raise_for_status()
    return response.json()


def handler(event):
    input_data = event.get("input", {})
    file_url = input_data.get("file_url")

    if not file_url:
        return {"error": "file_url is required"}

    try:
        _wait_for_api_ready()
    except Exception as e:
        return {"error": f"mineru-api not ready: {str(e)}"}

    with tempfile.TemporaryDirectory() as tmpdir:
        input_path = os.path.join(tmpdir, "input.pdf")
        output_dir = os.path.join(tmpdir, "out")
        os.makedirs(output_dir, exist_ok=True)

        try:
            _download_file(file_url, input_path)
        except Exception as e:
            return {"error": f"download failed: {str(e)}"}

        try:
            api_result = _call_mineru_api(input_path, output_dir)
        except requests.HTTPError as e:
            body = None
            try:
                body = e.response.text
            except Exception:
                pass
            return {
                "error": "mineru-api request failed",
                "status_code": getattr(e.response, "status_code", None),
                "response_text": body
            }
        except Exception as e:
            return {"error": f"mineru-api call failed: {str(e)}"}

        markdown = _collect_markdown_from_output_dir(output_dir)

        # إذا الـ API رجع output مختلف، رجّع response الخام أيضًا للمساعدة في debug
        if not markdown:
            return {
                "error": "no markdown found after parsing",
                "api_result": api_result,
                "files": list(glob.glob(os.path.join(output_dir, "**", "*"), recursive=True))
            }

        return {
            "success": True,
            "markdown": markdown[:4000],
            "api_result": api_result
        }


runpod.serverless.start({"handler": handler})
