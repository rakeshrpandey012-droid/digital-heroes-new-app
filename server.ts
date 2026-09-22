import express from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";

import { store } from "./server/store.ts";
import {
  isDbConnected,
  getDatabaseStatus,
} from "./server/db.ts";

import authRoutes from "./server/routes/authRoutes.ts";
import scoreRoutes from "./server/routes/scoreRoutes.ts";
import charityRoutes from "./server/routes/charityRoutes.ts";
import drawRoutes from "./server/routes/drawRoutes.ts";
import winnerRoutes from "./server/routes/winnerRoutes.ts";
import adminRoutes from "./server/routes/adminRoutes.ts";

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
   BODY PARSING
========================================================= */

app.use(express.json({ limit: "10mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

/* =========================================================
   REQUEST LOGGER
========================================================= */

if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(
      `[REQUEST] ${req.method} ${req.originalUrl}`
    );

    next();
  });
}

/* =========================================================
   DATABASE
========================================================= */

let databaseInitialized = false;

async function initializeDatabase() {
  if (databaseInitialized && isDbConnected()) {
    return;
  }

  try {
    console.log(
      "[DATABASE] Initializing MongoDB Atlas..."
    );

    await store.init();

    databaseInitialized = true;

    console.log(
      `[DATABASE] MongoDB Atlas: ${
        isDbConnected()
          ? "CONNECTED"
          : "NOT CONNECTED"
      }`
    );
  } catch (error: any) {
    console.error(
      "[DATABASE] Initialization failed:",
      error?.message || error
    );
  }
}

/* =========================================================
   HEALTH
========================================================= */

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    status: "online",
    platform: "Digital Heroes Platform",
    version: "1.0.0",
    environment:
      process.env.NODE_ENV || "development",
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
    await initializeDatabase();

    const metrics = await store.getLiveAtlasMetrics();

    res.json({
      success: true,
      connected: isDbConnected(),
      ...metrics,
    });
  } catch (error: any) {
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

app.use(
  "/api/auth",
  async (_req, _res, next) => {
    await initializeDatabase();
    next();
  },
  authRoutes
);

app.use(
  "/api/scores",
  async (_req, _res, next) => {
    await initializeDatabase();
    next();
  },
  scoreRoutes
);

app.use(
  "/api/charities",
  async (_req, _res, next) => {
    await initializeDatabase();
    next();
  },
  charityRoutes
);

app.use(
  "/api/draws",
  async (_req, _res, next) => {
    await initializeDatabase();
    next();
  },
  drawRoutes
);

app.use(
  "/api/winners",
  async (_req, _res, next) => {
    await initializeDatabase();
    next();
  },
  winnerRoutes
);

app.use(
  "/api/admin",
  async (_req, _res, next) => {
    await initializeDatabase();
    next();
  },
  adminRoutes
);

/* =========================================================
   API 404
========================================================= */

app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    error: "API endpoint not found",
    path: req.originalUrl,
    method: req.method,
  });
});

/* =========================================================
   VITE
========================================================= */

async function configureFrontend() {
  if (process.env.NODE_ENV !== "production") {
    console.log(
      "[FRONTEND] Starting Vite development server..."
    );

    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: "spa",
    });

    app.use(vite.middlewares);

    return;
  }

  const distPath = path.join(
    process.cwd(),
    "dist"
  );

  app.use(express.static(distPath));

  app.get("*", (_req, res) => {
    res.sendFile(
      path.join(distPath, "index.html")
    );
  });
}

/* =========================================================
   START
========================================================= */

async function start() {
  console.log("");
  console.log(
    "=========================================="
  );
  console.log(
    "       DIGITAL HEROES PLATFORM"
  );
  console.log(
    "=========================================="
  );

  await initializeDatabase();

  await configureFrontend();

  const port =
    Number(process.env.PORT) || 3000;

  app.listen(port, "0.0.0.0", () => {
    console.log("");
    console.log(
      `[SERVER] Running at http://localhost:${port}`
    );

    console.log(
      `[SERVER] Health: http://localhost:${port}/api/health`
    );

    console.log(
      `[SERVER] Database: http://localhost:${port}/api/database/status`
    );

    console.log(
      `[DATABASE] MongoDB: ${
        isDbConnected()
          ? "CONNECTED"
          : "NOT CONNECTED"
      }`
    );

    console.log("");
  });
}

start().catch((error) => {
  console.error(
    "[SERVER] Fatal error:",
    error
  );

  process.exit(1);
});

export default app;