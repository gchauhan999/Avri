// Builds print-ready PDFs from the brochure sources.
//
//   node build-pdf.mjs
//
// Inlines logo-color.png and cover-photo.jpg as data URIs (so the PDF has no
// external file dependency), then drives headless Chrome's print-to-pdf. Both sources
// declare their own @page size, which Chrome honours:
//   letterhead.html -> A4 portrait   (210 x 297 mm)
//   brochure.html   -> A4 landscape  (297 x 210 mm)

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const at = (f) => resolve(here, f);

const CHROME = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
].find(existsSync);

if (!CHROME) throw new Error("No Chrome or Edge found to render the PDFs.");

const logo =
  "data:image/png;base64," + readFileSync(at("logo-color.png")).toString("base64");

const coverPhoto =
  "data:image/jpeg;base64," + readFileSync(at("cover-photo.jpg")).toString("base64");

const jobs = [
  { src: "letterhead.html", build: "letterhead.build.html", pdf: "Avri-Energy-Letterhead.pdf" },
  { src: "brochure.html", build: "brochure.build.html", pdf: "Avri-Energy-Company-Profile.pdf" },
];

for (const job of jobs) {
  const html = readFileSync(at(job.src), "utf8")
    .replaceAll("__LOGO_COLOR__", logo)
    .replaceAll("__COVER_PHOTO__", coverPhoto);
  writeFileSync(at(job.build), html);

  execFileSync(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--no-pdf-header-footer",
      "--run-all-compositor-stages-before-draw",
      "--virtual-time-budget=10000",
      `--print-to-pdf=${at(job.pdf)}`,
      pathToFileURL(at(job.build)).href,
    ],
    { stdio: "inherit" }
  );

  console.log(`${job.pdf} <- ${job.src}`);
}
