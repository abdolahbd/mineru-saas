import express from "express";
import multer from "multer";
import { randomUUID } from "crypto";
import { documentQueue } from "../queue.js";
import { setJobState } from "../jobState.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const jobId = randomUUID();

    setJobState(jobId, {
      jobId,
      originalName: req.file.originalname,
      status: "queued",
      progress: 0,
      createdAt: new Date().toISOString()
    });

    await documentQueue.add(
      "process-document",
      {
        jobId,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        bufferBase64: req.file.buffer.toString("base64")
      },
      {
        attempts: 2,
        backoff: { type: "exponential", delay: 10000 },
      }
    );

    res.json({ jobId, status: "queued" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
