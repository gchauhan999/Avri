/**
 * The one place an error turns into a response.
 *
 * Everything the API rejects on purpose is an `HttpError` and is reported as
 * written. Anything else is a bug: it is logged with its stack and reported as
 * a generic 500, so an internal message or a SQL fragment never reaches a
 * caller.
 */

import type { ErrorRequestHandler, RequestHandler } from "express";
import { MulterError } from "multer";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { HttpError } from "../helpers/http-error.js";
import { logger } from "../config/logger.js";

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    /** Field name → message. Renders under the matching form input. */
    fields?: Record<string, string>;
  };
}

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: `No route for ${req.method} ${req.path}` },
  } satisfies ApiErrorBody);
};

/** Zod issues → the flat `{ field: message }` shape the forms already render. */
function fieldsFromZod(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    // First message per field wins; the form only shows one line per input.
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}

function fromMulter(error: MulterError): HttpError {
  switch (error.code) {
    case "LIMIT_FILE_SIZE":
      return new HttpError(413, "FILE_TOO_LARGE", "That file is too large.", {
        [error.field ?? "file"]: "That file is too large.",
      });
    case "LIMIT_FILE_COUNT":
    case "LIMIT_UNEXPECTED_FILE":
      return new HttpError(400, "UNEXPECTED_FILE", "Unexpected file upload.");
    case "LIMIT_PART_COUNT":
    case "LIMIT_FIELD_COUNT":
    case "LIMIT_FIELD_KEY":
    case "LIMIT_FIELD_VALUE":
      return new HttpError(400, "MALFORMED_UPLOAD", "That submission could not be read.");
    default:
      return new HttpError(400, "UPLOAD_FAILED", "That upload could not be processed.");
  }
}

/** MySQL errors that mean the caller did something wrong, not the server. */
function fromMysql(error: { code?: string; sqlMessage?: string }): HttpError | null {
  switch (error.code) {
    case "ER_DUP_ENTRY":
      return new HttpError(409, "DUPLICATE", "That already exists.");
    case "ER_NO_REFERENCED_ROW":
    case "ER_NO_REFERENCED_ROW_2":
      return new HttpError(422, "INVALID_REFERENCE", "That refers to something that no longer exists.");
    case "ER_ROW_IS_REFERENCED":
    case "ER_ROW_IS_REFERENCED_2":
      return new HttpError(409, "IN_USE", "That is still in use and cannot be deleted.");
    case "ER_CHECK_CONSTRAINT_VIOLATED":
      // In practice this is only the clients publish/authorise rule.
      return new HttpError(
        422,
        "CHECK_FAILED",
        "A client cannot be published until it has been marked as authorised."
      );
    default:
      return null;
  }
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  let error: HttpError;

  if (err instanceof HttpError) {
    error = err;
  } else if (err instanceof ZodError) {
    error = new HttpError(
      422,
      "VALIDATION_FAILED",
      "Please correct the highlighted fields.",
      fieldsFromZod(err)
    );
  } else if (err instanceof MulterError) {
    error = fromMulter(err);
  } else {
    error = fromMysql(err as { code?: string }) ?? new HttpError(500, "SERVER_ERROR", "Something went wrong.");
  }

  if (error.status >= 500) {
    logger.error({ err, path: req.path, method: req.method }, "unhandled error");
  } else {
    logger.warn(
      { code: error.code, status: error.status, path: req.path, method: req.method },
      error.message
    );
  }

  const body: ApiErrorBody = {
    error: {
      code: error.code,
      message: error.message,
      ...(error.fields ? { fields: error.fields } : {}),
    },
  };

  // A stack trace is useful locally and is an information leak in production.
  if (!env.isProduction && error.status >= 500 && err instanceof Error) {
    (body.error as Record<string, unknown>).stack = err.stack;
  }

  res.status(error.status).json(body);
};
