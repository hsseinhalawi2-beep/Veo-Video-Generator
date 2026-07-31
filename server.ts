import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, GenerateVideosOperation } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable large payload limit for base64 uploaded photos
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Helper to initialize Gemini SDK safely on the server
function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please set your GEMINI_API_KEY in Settings > Secrets."
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 1. Start video generation endpoint
app.post("/api/generate-video", async (req, res) => {
  try {
    const { prompt, image, aspectRatio = "16:9", resolution = "720p" } = req.body;

    const ai = getAI();

    const config: any = {
      numberOfVideos: 1,
      resolution, // '720p' or '1080p'
      aspectRatio, // '16:9' or '9:16'
    };

    const requestOptions: any = {
      model: "veo-3.1-fast-generate-preview",
      config,
    };

    if (prompt && typeof prompt === "string" && prompt.trim().length > 0) {
      requestOptions.prompt = prompt.trim();
    }

    if (image && image.base64Bytes && image.mimeType) {
      // Clean base64 string if it contains data prefix
      let rawBase64 = image.base64Bytes;
      if (rawBase64.includes(",")) {
        rawBase64 = rawBase64.split(",")[1];
      }
      requestOptions.image = {
        imageBytes: rawBase64,
        mimeType: image.mimeType,
      };
    }

    if (!requestOptions.prompt && !requestOptions.image) {
      return res.status(400).json({
        error: "Please provide a prompt or a photo to animate.",
      });
    }

    console.log("Starting Veo video generation with model veo-3.1-fast-generate-preview...");
    const operation = await ai.models.generateVideos(requestOptions);
    console.log("Operation launched:", operation.name);

    res.json({
      operationName: operation.name,
      status: "processing",
    });
  } catch (err: any) {
    console.error("Error launching video generation:", err);
    res.status(500).json({
      error: err.message || "Failed to start video generation.",
    });
  }
});

// 2. Poll status endpoint
app.post("/api/video-status", async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: "operationName is required" });
    }

    const ai = getAI();
    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });

    if (updated.error) {
      return res.json({
        done: true,
        error: updated.error.message || "Video generation encountered an error.",
      });
    }

    res.json({
      done: updated.done,
      metadata: updated.metadata,
    });
  } catch (err: any) {
    console.error("Error getting video status:", err);
    res.status(500).json({ error: err.message || "Failed to check status" });
  }
});

// 3. Download/Stream endpoint via POST
app.post("/api/video-download", async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: "operationName is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is missing" });
    }

    const ai = getAI();
    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });

    if (updated.error) {
      return res.status(500).json({ error: updated.error.message || "Operation failed" });
    }

    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      return res.status(404).json({ error: "Video stream URI not ready" });
    }

    console.log("Fetching video from URI:", uri);
    const videoRes = await fetch(uri, {
      headers: { "x-goog-api-key": apiKey },
    });

    if (!videoRes.ok) {
      return res.status(videoRes.status).json({
        error: `Failed to download video from storage (${videoRes.statusText})`,
      });
    }

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", 'attachment; filename="veo-3.1-video.mp4"');

    const arrayBuffer = await videoRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (err: any) {
    console.error("Error downloading video stream:", err);
    res.status(500).json({ error: err.message || "Failed to download video" });
  }
});

// 4. Stream endpoint via GET query for direct <video src="..." /> playback
app.get("/api/video-stream", async (req, res) => {
  try {
    const operationName = req.query.op as string;
    if (!operationName) {
      return res.status(400).send("op parameter is required");
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).send("GEMINI_API_KEY is missing");
    }

    const ai = getAI();
    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;

    if (!uri) {
      return res.status(404).send("Video URI not available");
    }

    const videoRes = await fetch(uri, {
      headers: { "x-goog-api-key": apiKey },
    });

    if (!videoRes.ok) {
      return res.status(videoRes.status).send("Failed to stream video");
    }

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Cache-Control", "public, max-age=86400");
    const arrayBuffer = await videoRes.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    res.status(500).send(err.message || "Error streaming video");
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
