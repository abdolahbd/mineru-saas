import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function markdownToJson(markdown) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

  const schema = {
    type: "object",
    properties: {
      document_type: { type: "string" },
      rows: {
        type: "array",
        items: {
          type: "object",
          properties: {
            label: { type: "string" },
            value: { type: "string" }
          },
          required: ["label", "value"]
        }
      }
    },
    required: ["document_type", "rows"]
  };

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Extract structured JSON from this markdown:\n\n${markdown}`
          }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema
    }
  };

  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    body,
    {
      headers: { "Content-Type": "application/json" }
    }
  );

  const text = res.data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  return JSON.parse(text);
}
