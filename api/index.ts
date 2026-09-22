import express from "express";
import cors from "cors";

import { store } from "../server/store.ts";
import { isDbConnected, getDatabaseStatus } from "../server/db.ts";

import authRoutes from "../server/routes/authRoutes.ts";
import scoreRoutes from "../server/routes/scoreRoutes.ts";
import charityRoutes from "../server/routes/charityRoutes.ts";
import drawRoutes from "../server/routes/drawRoutes.ts";
import winnerRoutes from "../server/routes/winnerRoutes.ts";
import adminRoutes from "../server/routes/adminRoutes.ts";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

let initialized = false;

async function initializeDatabase() {
  if (initialized && isDbConnected()) {
    return;
  }

  try {
    console.log("[API] Initializing MongoDB Atlas...");

    await store.init();

    initialized = true;

    console.log(
      `[API] MongoDB Atlas: ${
        isDbConnected() ? "CONNECTED" : "CONNECTING..."
      }`
    );
  } catch (error: any) {
    console.error(
      "[API] MongoDB initialization error:",
      error?.message || error
    );
  }
}

// Make sure DB is initialized before API routes
app.use(async (_req, _res, next) => {
  await initializeDatabase();
  next();
});

// Health
app.get("/api/health", (_req, res) => {
  res.json({
    status: "online",
    platform: "Digital Heroes Platform",
    version: "1.0.0",
    database: getDatabaseStatus(),
    timestamp: new Date().toISOString(),
  });
});

// Database status
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
      error: error?.message || "Failed to retrieve database status",
    });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/charities", charityRoutes);
app.use("/api/draws", drawRoutes);
app.use("/api/winners", winnerRoutes);
app.use("/api/admin", adminRoutes);

export default app;