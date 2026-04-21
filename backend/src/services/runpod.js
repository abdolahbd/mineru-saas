import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function runMineru(fileUrl) {
  const endpointId = process.env.RUNPOD_ENDPOINT_ID;
  const apiKey = process.env.RUNPOD_API_KEY;

  const submit = await axios.post(
    `https://api.runpod.ai/v2/${endpointId}/run`,
    { input: { file_url: fileUrl } },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    }
  );

  const jobId = submit.data.id;

  for (let i = 0; i < 120; i++) {
    await new Promise((r) => setTimeout(r, 3000));

    const status = await axios.get(
      `https://api.runpod.ai/v2/${endpointId}/status/${jobId}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` }
      }
    );

    if (status.data.status === "COMPLETED") {
      return status.data.output.markdown || "";
    }

    if (status.data.status === "FAILED") {
      throw new Error("RunPod worker failed");
    }
  }

  throw new Error("RunPod timeout");
}
