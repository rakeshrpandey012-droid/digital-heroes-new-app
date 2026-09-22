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

/* =========================================================
   CORS
   ========================================================= */

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // such as Postman/server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      // Allow local development
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow Vercel deployments
      if (
        origin.endsWith(".vercel.app") ||
        origin === process.env.FRONTEND_URL
      ) {
        return callback(null, true);
      }

      // Don't crash the server because of CORS.
      return callback(null, false);
    },
    credentials: true,
  })
);

/* =========================================================
   BODY PARSING
   ========================================================= */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* =========================================================
   REQUEST LOGGER - DEVELOPMENT
   ========================================================= */

if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(`[Request] ${req.method} ${req.originalUrl}`);
    next();
  });
}

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
        "[Database] Initializing MongoDB Atlas connection..."
      );

      await store.init();

      databaseInitialized = true;

      console.log(
        `[Database] MongoDB Atlas: ${
          isDbConnected() ? "CONNECTED" : "NOT CONNECTED"
        }`
      );
    } catch (error: any) {
      console.error(
        "[Database] Initialization error:",
        error?.message || error
      );

      // Do not terminate the application.
      // This allows health/error endpoints to respond.
    } finally {
      databaseInitializationPromise = null;
    }
  })();

  return databaseInitializationPromise;
}

/*
 * Initialize MongoDB before API requests.
 *
 * Static frontend requests do not need MongoDB.
 */
app.use("/api", async (_req, _res, next) => {
  await initializeDatabase();
  next();
});

/* =========================================================
   HEALTH CHECK
   ========================================================= */

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    status: "online",
    platform: "Digital Heroes Platform",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    database: getDatabaseStatus(),
    timestamp: new Date().toISOString(),
  });
});

/* =========================================================
   DATABASE STATUS
   ========================================================= */

app.get("/api/database/status", async (_req, res) => {
  try {
    const metrics = await store.getLiveAtlasMetrics();

    res.json({
      success: true,
      connected: isDbConnected(),
      ...metrics,
    });
  } catch (error: any) {
    console.error(
      "[Database] Status error:",
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
   API ROUTES
   ========================================================= */

console.log("[Server] Registering API routes...");

app.use("/api/auth", authRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/charities", charityRoutes);
app.use("/api/draws", drawRoutes);
app.use("/api/winners", winnerRoutes);
app.use("/api/admin", adminRoutes);

console.log("[Server] API routes registered.");

/* =========================================================
   API 404 HANDLER
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
   VITE DEVELOPMENT / PRODUCTION FRONTEND
   ========================================================= */

async function configureFrontend() {
  if (process.env.NODE_ENV !== "production") {
    console.log("[Frontend] Starting Vite development middleware...");

    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: "spa",
    });

    app.use(vite.middlewares);

    console.log("[Frontend] Vite development middleware ready.");
  } else {
    const distPath = path.join(process.cwd(), "dist");

    console.log(
      `[Frontend] Serving production files from: ${distPath}`
    );

    app.use(express.static(distPath));

    /*
     * React/Vite SPA fallback.
     *
     * IMPORTANT:
     * This comes AFTER /api routes, so an unknown API request
     * does not receive index.html.
     */
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

/* =========================================================
   SERVER START
   ========================================================= */

async function start() {
  console.log("");
  console.log("==========================================");
  console.log("       DIGITAL HEROES PLATFORM");
  console.log("==========================================");
  console.log("");

  console.log(
    `[Server] Environment: ${
      process.env.NODE_ENV || "development"
    }`
  );

  console.log(
    `[Server] Starting MongoDB Atlas initialization...`
  );

  await initializeDatabase();

  await configureFrontend();

  const port = Number(process.env.PORT) || 3000;

  app.listen(port, "0.0.0.0", () => {
    console.log("");
    console.log("==========================================");
    console.log("          SERVER READY");
    console.log("==========================================");
    console.log(
      `[Server] Local URL: http://localhost:${port}`
    );
    console.log(
      `[Server] Health: http://localhost:${port}/api/health`
    );
    console.log(
      `[Server] Database: http://localhost:${port}/api/database/status`
    );
    console.log(
      `[Server] MongoDB: ${
        isDbConnected() ? "CONNECTED" : "NOT CONNECTED"
      }`
    );
    console.log("==========================================");
    console.log("");
  });
}

/* =========================================================
   START APPLICATION
   ========================================================= */

start().catch((error) => {
  console.error("");
  console.error("==========================================");
  console.error("       FATAL SERVER ERROR");
  console.error("==========================================");
  console.error(error);
  console.error("==========================================");

  process.exit(1);
});

export default app;