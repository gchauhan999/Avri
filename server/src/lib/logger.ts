import { pino } from "pino";
import { env } from "../config/env.js";

/**
 * In development, pretty-print through pino's transport if it is installed;
 * in production emit JSON so a log shipper can parse it.
 */
export const logger = pino({
  level: env.logLevel,
  redact: {
    paths: [
      "req.headers.cookie",
      "req.headers.authorization",
      "res.headers['set-cookie']",
      "password",
      "*.password",
      "*.passwordHash",
    ],
    remove: true,
  },
  ...(env.isProduction
    ? {}
    : {
        transport: {
          target: "pino/file",
          options: { destination: 1 },
        },
      }),
});
