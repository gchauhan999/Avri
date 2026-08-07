"use client";

import { useRef, useState } from "react";
import { apiBrowser } from "../lib/api";
import { Button } from "./ui";

export interface UploadedImage {
  path: string;
  url: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Uploads straight from the browser to the API, then reports back the stored
 * path via hidden inputs so the surrounding form submits it as plain text.
 *
 * Deliberately not routed through a server action: binaries would then travel
 * browser → Next → Express, and server actions have a 1 MB default body limit
 * that a cover photo will exceed.
 *
 * The API re-encodes everything through sharp, so what comes back is a
 * validated WebP with known dimensions — which is why the preview can be
 * trusted and why `next/image` never has to guess a size.
 */
export default function ImageUpload({
  endpoint,
  label,
  hint,
  initial,
  aspect = "aspect-[3/1]",
}: {
  /** e.g. "/api/admin/clients/logo" */
  endpoint: string;
  label: string;
  hint?: string;
  initial?: { path: string; url: string; width?: number | null; height?: number | null } | null;
  aspect?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<UploadedImage | null>(
    initial
      ? {
          path: initial.path,
          url: initial.url,
          width: initial.width ?? 0,
          height: initial.height ?? 0,
          bytes: 0,
        }
      : null
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    setBusy(true);
    try {
      const body = new FormData();
      body.append("image", file);
      // No Content-Type header — the browser must set the multipart boundary.
      const result = await apiBrowser<UploadedImage>(endpoint, { method: "POST", body });
      setImage(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That image could not be uploaded.");
    } finally {
      setBusy(false);
    }
  }

  function clear() {
    // `input.files` is read-only; resetting the value is the only way.
    if (inputRef.current) inputRef.current.value = "";
    setImage(null);
    setError(null);
  }

  return (
    <div>
      <span className="block text-sm font-semibold text-ink-800">{label}</span>

      {/* What the surrounding form actually submits. */}
      <input type="hidden" name="logoPath" value={image?.path ?? ""} />
      <input type="hidden" name="logoWidth" value={image?.width || ""} />
      <input type="hidden" name="logoHeight" value={image?.height || ""} />

      <div className="mt-1.5">
        {image ? (
          <div className="flex items-start gap-4">
            <div
              className={`flex ${aspect} w-40 items-center justify-center overflow-hidden rounded-lg border border-ink-200 bg-white p-2`}
            >
              {/* Plain <img>: the URL is on another origin in development and
                  this is a 40mm preview, not a page image. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="" className="max-h-full max-w-full object-contain" />
            </div>
            <div className="text-sm">
              {image.width ? (
                <p className="text-ink-500">
                  {image.width} × {image.height} px
                </p>
              ) : null}
              <button
                type="button"
                onClick={clear}
                className="mt-2 text-sm font-semibold text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <label
            className={`flex ${aspect} w-full max-w-sm cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 text-center transition-colors ${
              error ? "border-red-400 bg-white" : "border-ink-200 bg-white hover:border-brand-500"
            }`}
          >
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              className="sr-only"
              disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file);
              }}
            />
            <span className="text-sm font-semibold text-ink-700">
              {busy ? "Uploading…" : "Choose an image"}
            </span>
            <span className="mt-1 text-xs text-ink-400">
              {hint ?? "PNG, JPEG or WebP · up to 3 MB"}
            </span>
          </label>
        )}
      </div>

      {error ? <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p> : null}

      {!error && !image ? (
        <p className="mt-1.5 text-xs text-ink-400">
          SVG is not accepted — an SVG can carry script, and it would be served from our own domain.
        </p>
      ) : null}

      {/* Replacing reuses the same hidden input, so there is only ever one. */}
      {image ? (
        <>
          <Button
            type="button"
            variant="ghost"
            className="mt-2 h-8 px-2 text-xs"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? "Uploading…" : "Replace"}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
          />
        </>
      ) : null}
    </div>
  );
}
