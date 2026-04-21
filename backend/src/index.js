import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import uploadRoute from "./routes/upload.js";
import jobsRoute from "./routes/jobs.js";
import "./workers/processor.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.use("/api/upload", uploadRoute);
app.use("/api/jobs", jobsRoute);

app.get("/", (req, res) => {
  res.json({ ok: true, message: "Backend is running" });
});

app.listen(process.env.PORT || 4000, () => {
  console.log(`Server running on port ${process.env.PORT || 4000}`);
});
