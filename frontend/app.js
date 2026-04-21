const API_BASE = "http://localhost:4000";
const form = document.getElementById("uploadForm");
const fileInput = document.getElementById("fileInput");
const statusBox = document.getElementById("statusBox");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = fileInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  statusBox.textContent = "Uploading...";

  const uploadRes = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    body: formData
  });

  const uploadData = await uploadRes.json();

  if (!uploadRes.ok) {
    statusBox.textContent = JSON.stringify(uploadData, null, 2);
    return;
  }

  statusBox.textContent = `Job queued: ${uploadData.jobId}`;

  const interval = setInterval(async () => {
    const res = await fetch(`${API_BASE}/api/jobs/${uploadData.jobId}`);
    const data = await res.json();

    statusBox.textContent = JSON.stringify(data, null, 2);

    if (data.status === "done" || data.status === "failed") {
      clearInterval(interval);
    }
  }, 2000);
});
