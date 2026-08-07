/**
 * One error type for everything the API deliberately rejects.
 *
 * Anything thrown that is not an HttpError is treated as a bug: it is logged
 * with its stack and reported to the caller as a generic 500, so an internal
 * message never leaks out through the API.
 */
export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  /** Field name → message. Maps 1:1 onto the forms' `FormState["errors"]`. */
  readonly fields?: Record<string, string>;

  constructor(
    status: number,
    code: string,
    message: string,
    fields?: Record<string, string>
  ) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    if (fields) this.fields = fields;
  }
}

export const badRequest = (message = "Bad request", code = "BAD_REQUEST") =>
  new HttpError(400, code, message);

export const unauthorized = (message = "Please sign in.", code = "UNAUTHORIZED") =>
  new HttpError(401, code, message);

export const forbidden = (message = "Not allowed.", code = "FORBIDDEN") =>
  new HttpError(403, code, message);

export const notFound = (message = "Not found.", code = "NOT_FOUND") =>
  new HttpError(404, code, message);

export const conflict = (message: string, code = "CONFLICT") =>
  new HttpError(409, code, message);

/** Validation failure. `fields` is what the form renders under each input. */
export const unprocessable = (
  fields: Record<string, string>,
  message = "Please correct the highlighted fields."
) => new HttpError(422, "VALIDATION_FAILED", message, fields);

export const tooLarge = (message: string, code = "FILE_TOO_LARGE") =>
  new HttpError(413, code, message);

export const unsupportedMedia = (message: string, code = "UNSUPPORTED_FILE") =>
  new HttpError(415, code, message);

export const serviceUnavailable = (message: string, code = "UNAVAILABLE") =>
  new HttpError(503, code, message);
