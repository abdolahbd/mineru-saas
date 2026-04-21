import fs from "fs";
import path from "path";
import os from "os";
import { Worker } from "bullmq";
import { redis } from "../redis.js";
import { setJobState } from "../jobState.js";
import { markdownToJson } from "../services/gemini.js";
import { jsonToExcel } from "../services/excel.js";

// لاحقًا بدّل markdown الوهمي بـ runMineru(fileUrl)
// import { runMineru } from "../services/runpod.js";

new Worker(
  "document-processing",
  async (job) => {
    const { jobId, originalName } = job.data;

    setJobState(jobId, {
      status: "processing_markdown",
      progress: 20
    });

    const markdown = `# Extracted Markdown\n\nOriginal file: ${originalName}`;

    setJobState(jobId, {
      status: "processing_json",
      progress: 60,
      markdown
    });

    const json = await markdownToJson(markdown);

    setJobState(jobId, {
      status: "processing_excel",
      progress: 85,
      json
    });

    const outputPath = path.join(os.tmpdir(), `${jobId}.xlsx`);
    await jsonToExcel(json, outputPath);

    setJobState(jobId, {
      status: "done",
      progress: 100,
      json,
      markdown,
      excelLocalPath: outputPath
    });
  },
  { connection: redis, concurrency: 1 }
);
