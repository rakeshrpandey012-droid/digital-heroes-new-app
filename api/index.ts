import express from "express";
import cors from "cors";

import { store } from "../server/store.ts";
import {
  isDbConnected,
  getDatabaseStatus,
} from "../server/db.ts";

import authRoutes from "../server/routes/authRoutes.ts";
import scoreRoutes from "../server/routes/scoreRoutes.ts";
import charityRoutes from "../server/routes/charityRoutes.ts";
import drawRoutes from "../server/routes/drawRoutes.ts";
import winnerRoutes from "../server/routes/winnerRoutes.ts";
import adminRoutes from "../server/routes/adminRoutes.ts";

const app = express();

/* =========================================================
   CORS
========================================================= */

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

/* =========================================================
   BODY PARSER
========================================================= */

app.use(express.json({ limit: "10mb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

/* =========================================================
   DATABASE INITIALIZATION
========================================================= */

let databaseInitialized = false;
let databaseInitializationPromise: Promise<void> | null = null;

async function initializeDatabase(): Promise<void> {
  if (databaseInitialized && isDbConnected()) {
    return;
  }

  if (databaseInitializationPromise) {
    return databaseInitializationPromise;
  }

  databaseInitializationPromise = (async () => {
    try {
      console.log(
        "[API] Initializing MongoDB Atlas connection..."
      );

      await store.init();

      databaseInitialized = true;

      console.log(
        `[API] MongoDB Atlas: ${
          isDbConnected()
            ? "CONNECTED"
            : "NOT CONNECTED"
        }`
      );
    } catch (error: any) {
      console.error(
        "[API] MongoDB initialization failed:",
        error?.message || error
      );
    } finally {
      databaseInitializationPromise = null;
    }
  })();

  return databaseInitializationPromise;
}

/*
 * Initialize MongoDB before API requests.
 */
app.use("/api", async (_req, _res, next) => {
  await initializeDatabase();
  next();
});

/* =========================================================
   HEALTH
========================================================= */

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "online",
    platform: "Digital Heroes Platform",
    version: "1.0.0",
    environment:
      process.env.NODE_ENV || "production",
    database: getDatabaseStatus(),
    mongodbConnected: isDbConnected(),
    timestamp: new Date().toISOString(),
  });
});

/* =========================================================
   DATABASE STATUS
========================================================= */

app.get("/api/database/status", async (_req, res) => {
  try {
    const metrics = await store.getLiveAtlasMetrics();

    res.status(200).json({
      success: true,
      connected: isDbConnected(),
      ...metrics,
    });
  } catch (error: any) {
    console.error(
      "[API] Database status error:",
      error?.message || error
    );

    res.status(500).json({
      success: false,
      connected: isDbConnected(),
      error:
        error?.message ||
        "Failed to retrieve database status",
    });
  }
});

/* =========================================================
   APPLICATION ROUTES
========================================================= */

app.use("/api/auth", authRoutes);

app.use("/api/scores", scoreRoutes);

app.use("/api/charities", charityRoutes);

app.use("/api/draws", drawRoutes);

app.use("/api/winners", winnerRoutes);

app.use("/api/admin", adminRoutes);

/* =========================================================
   API 404
========================================================= */

app.use("/api", (req, res) => {
  console.warn(
    `[API 404] ${req.method} ${req.originalUrl}`
  );

  res.status(404).json({
    success: false,
    error: "API endpoint not found",
    path: req.originalUrl,
    method: req.method,
  });
});

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use(
  (
    error: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(
      "[API ERROR]",
      error?.message || error
    );

    res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Internal server error",
    });
  }
);

/*
 * IMPORTANT:
 * Vercel needs the Express application exported.
 *
 * Do NOT use app.listen() here.
 */

export default app;