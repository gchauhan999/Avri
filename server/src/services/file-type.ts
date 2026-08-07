/**
 * Magic-number verification for uploaded résumés.
 *
 * Multer already checked the extension and the MIME type, and neither is worth
 * much: both come from the client. `payload.exe` renamed to `resume.pdf` and
 * sent with `Content-Type: application/pdf` passes every check up to this one.
 *
 * This reads the first few bytes off disk and compares them to what the format
 * actually starts with. It is not antivirus — a genuinely malicious PDF is
 * still a malicious PDF — but it stops the trivial case, and the file is never
 * executed, never served inline, and never stored under a web root.
 */

import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";

export type ResumeKind = "pdf" | "doc" | "docx";

const SIGNATURES: { kind: ResumeKind; bytes: number[]; label: string }[] = [
  // "%PDF-"
  { kind: "pdf", bytes: [0x25, 0x50, 0x44, 0x46, 0x2d], label: "PDF" },
  // "PK\x03\x04" — .docx is a zip container. So are .xlsx and .pptx, which is
  // why the extension still has to agree.
  { kind: "docx", bytes: [0x50, 0x4b, 0x03, 0x04], label: "DOCX" },
  // OLE2 compound document — legacy .doc.
  { kind: "doc", bytes: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1], label: "DOC" },
];

export interface FileCheck {
  ok: boolean;
  kind?: ResumeKind;
  /** Hex SHA-256 of the whole file, for duplicate detection. */
  sha256: string;
  size: number;
}

/** True when the file's leading bytes match one of the accepted formats. */
export async function verifyResume(
  absolutePath: string,
  extension: string
): Promise<FileCheck> {
  const handle = await fs.open(absolutePath, "r");
  let header: Buffer;
  let size: number;

  try {
    const stat = await handle.stat();
    size = stat.size;
    header = Buffer.alloc(16);
    await handle.read(header, 0, 16, 0);
  } finally {
    await handle.close();
  }

  const matched = SIGNATURES.find((signature) =>
    signature.bytes.every((byte, index) => header[index] === byte)
  );

  const sha256 = await hashFile(absolutePath);
  const ext = extension.replace(/^\./, "").toLowerCase();

  if (!matched) return { ok: false, sha256, size };

  /**
   * The signature and the extension must agree. A .docx really is a zip, so
   * without this a renamed .xlsx — or any zip at all — would sail through.
   */
  const consistent =
    (matched.kind === "pdf" && ext === "pdf") ||
    (matched.kind === "docx" && ext === "docx") ||
    (matched.kind === "doc" && ext === "doc");

  return { ok: consistent, kind: matched.kind, sha256, size };
}

/** Streamed, so a 5 MB file is not held in memory twice. */
export function hashFile(absolutePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(absolutePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}
