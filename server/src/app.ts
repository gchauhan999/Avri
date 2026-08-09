/**
 * Builds the Express application.
 *
 * Kept separate from `index.ts` (which listens) so the app can be constructed
 * in a test without binding a port.
 */

import path from "node:path";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { pingDatabase } from "./config/database.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.js";
import { publicRead } from "./middlewares/rate-limit.js";
import { routes } from "./routes/index.js";

export function createApp(): Express {
  const app = express();

  /**
   * How many reverse proxies sit in front. Rate limiting reads `req.ip`, so
   * this has to be right: too low and every request looks like it came from
   * nginx; too high and a client can spoof its address via X-Forwarded-For.
   */
  app.set("trust proxy", env.trustProxy);
  app.disable("x-powered-by");

  app.use(
    helmet({
      // This origin serves JSON and image files, never HTML, so a CSP here
      // would only constrain documents that do not exist.
      contentSecurityPolicy: false,
      // Uploaded images are loaded by the website and the admin panel, which
      // are different origins in development.
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  app.use(
    cors({
      origin(origin, callback) {
        // No Origin header: curl, server-to-server, same-origin navigation.
        if (!origin) return callback(null, true);
        if (env.corsOrigins.includes(origin.replace(/\/$/, ""))) return callback(null, true);
        logger.warn({ origin }, "blocked by CORS");
        return callback(null, false);
      },
      credentials: true,
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
      // `X-Admin-Request` is the CSRF guard — see middlewares/require-admin-header.
      allowedHeaders: ["Content-Type", "Accept", "X-Admin-Request"],
      // So the admin panel can read the filename off a résumé download.
      exposedHeaders: ["Content-Disposition"],
      maxAge: 86400,
    })
  );

  app.use(cookieParser());
  // Generous enough for a long blog post, small enough that a JSON body cannot
  // be used to exhaust memory. File uploads go through multer, not this.
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false, limit: "100kb" }));

  app.use(
    pinoHttp({
      logger,
      autoLogging: { ignore: (req) => req.url === "/api/health" },
    })
  );

  /**
   * Public images: client logos and blog covers.
   *
   * This maps to `storage/public` only. Résumés live in `storage/resumes`, a
   * sibling directory that is deliberately not served by anything — they are
   * reachable only through the authenticated download route.
   */
  app.use(
    "/uploads",
    express.static(path.join(env.storageRoot, "public"), {
      index: false,
      dotfiles: "deny",
      redirect: false,
      fallthrough: false,
      maxAge: "365d",
      immutable: true,
      setHeaders: (res) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
      },
    })
  );

  app.get("/api/health", publicRead, async (_req, res) => {
    const dbUp = await pingDatabase();
    res.status(dbUp ? 200 : 503).json({
      ok: dbUp,
      service: "avri-api",
      env: env.nodeEnv,
      uptimeSeconds: Math.round(process.uptime()),
      db: dbUp ? "up" : "down",
    });
  });

  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
