import express from "express";
import { getJobState } from "../jobState.js";

const router = express.Router();

router.get("/:jobId", async (req, res) => {
  const data = getJobState(req.params.jobId);
  if (!data) {
    return res.status(404).json({ error: "Job not found" });
  }
  res.json(data);
});

export default router;
