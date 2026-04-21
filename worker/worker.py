import runpod

def handler(event):
    input_data = event.get("input", {})
    file_url = input_data.get("file_url", "")
    return {
        "markdown": f"# Markdown from worker\n\nSource: {file_url}"
    }

runpod.serverless.start({"handler": handler})
