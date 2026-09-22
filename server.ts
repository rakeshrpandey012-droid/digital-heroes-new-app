import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

import { store } from "./server/store.ts";
import { isDbConnected, getDatabaseStatus } from "./server/db.ts";
import authRoutes from "./server/routes/authRoutes.ts";
import scoreRoutes from "./server/routes/scoreRoutes.ts";
import charityRoutes from "./server/routes/charityRoutes.ts";
import drawRoutes from "./server/routes/drawRoutes.ts";
import winnerRoutes from "./server/routes/winnerRoutes.ts";
import adminRoutes from "./server/routes/adminRoutes.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health & System Info
app.get("/api/health", (_req, res) => {
  res.json({
    status: "online",
    platform: "Digital Heroes Platform",
    version: "1.0.0",
    database: getDatabaseStatus(),
    timestamp: new Date().toISOString(),
  });
});

// Real Database Status Endpoint
app.get("/api/database/status", async (_req, res) => {
  try {
    const metrics = await store.getLiveAtlasMetrics();
    res.json({
      success: true,
      ...metrics,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to retrieve database status",
    });
  }
});

// Application Routes
app.use("/api/auth", authRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/charities", charityRoutes);
app.use("/api/draws", drawRoutes);
app.use("/api/winners", winnerRoutes);
app.use("/api/admin", adminRoutes);

async function start() {
  console.log("[Server] Initializing Digital Heroes platform with MongoDB Atlas...");
  
  // Connect and synchronize with MongoDB Atlas
  try {
    await store.init();
  } catch (err: any) {
    console.error("[Server] Warning: Database initialization had an issue:", err.message || err);
  }

  // Handle Vite middleware (development) or static build files (production)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const port = 3000;

  app.listen(port, "0.0.0.0", () => {
    console.log(`[Server] ⛳ Digital Heroes server ready on http://0.0.0.0:${port}`);
    console.log(`[Server] 🗄️  MongoDB Atlas: ${isDbConnected() ? "CONNECTED" : "CONNECTING..."}`);
  });
}

start().catch((error) => {
  console.error("[Server] Fatal bootstrap error:", error);
  process.exit(1);
});
