"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import JobCard from "@/components/ui/JobCard";
import { ButtonLink } from "@/components/ui/Button";
import { employmentLabel } from "@/lib/careers";
import type { EmploymentType, JobSummary } from "@/lib/types";

/**
 * Filterable list of open roles.
 *
 * Client-side filtering, unlike the blog index. A careers list is a handful of
 * items and no one searches Google for "Avri Energy jobs in the substations
 * department", so crawlable filter URLs buy nothing here — whereas instant
 * filtering with no navigation is genuinely nicer to use. The blog makes the
 * opposite trade for the opposite reason.
 */
export default function CareersExplorer({ jobs }: { jobs: JobSummary[] }) {
  const [department, setDepartment] = useState("All");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");

  // Facets derive from the data, so a new department needs no code change.
  const departments = useMemo(
    () => ["All", ...Array.from(new Set(jobs.map((j) => j.department).filter(Boolean)))] as string[],
    [jobs]
  );
  const locations = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.location))).sort(),
    [jobs]
  );
  const types = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.employmentType))),
    [jobs]
  );

  const filtered = jobs.filter(
    (job) =>
      (department === "All" || job.department === department) &&
      (!location || job.location === location) &&
      (!type || job.employmentType === type)
  );

  const filtering = department !== "All" || location !== "" || type !== "";

  function reset() {
    setDepartment("All");
    setLocation("");
    setType("");
  }

  if (jobs.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-ink-200 bg-white px-6 py-16 text-center">
        <p className="text-base font-semibold text-ink-800">No openings right now</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
          We hire steadily through the year. Send us your CV and we will keep it on file — when
          something opens that fits, you will be among the first we call.
        </p>
        <div className="mt-6">
          <ButtonLink href="/careers/apply">Send your CV</ButtonLink>
        </div>
      </div>
    );
  }

  const control =
    "h-11 rounded-xl border border-ink-200 bg-white px-4 text-sm text-ink-900 transition-colors focus:border-brand-500 focus:outline-none";

  return (
    <div>
      {departments.length > 2 ? (
        <div className="flex flex-wrap gap-2">
          {departments.map((option) => {
            const active = department === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setDepartment(option)}
                aria-pressed={active}
                className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  active ? "text-white" : "border border-ink-200 bg-white text-ink-600 hover:border-ink-300"
                }`}
              >
                {active ? (
                  <motion.span
                    layoutId="careers-filter-pill"
                    className="absolute inset-0 rounded-full bg-brand-500"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                ) : null}
                <span className="relative">{option}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Two selects rather than three rows of pills. */}
      {locations.length > 1 || types.length > 1 ? (
        <div className="mt-4 flex flex-wrap gap-3">
          {locations.length > 1 ? (
            <select
              aria-label="Filter by location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={control}
            >
              <option value="">All locations</option>
              {locations.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          ) : null}

          {types.length > 1 ? (
            <select
              aria-label="Filter by type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={control}
            >
              <option value="">All types</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {employmentLabel(t as EmploymentType)}
                </option>
              ))}
            </select>
          ) : null}
        </div>
      ) : null}

      <p className="mt-6 text-sm text-ink-500" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "role" : "roles"}
        {filtering ? (
          <>
            {" "}
            ·{" "}
            <button
              type="button"
              onClick={reset}
              className="font-semibold text-brand-600 hover:underline"
            >
              Clear filters
            </button>
          </>
        ) : null}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-ink-200 bg-white px-6 py-14 text-center">
          <p className="text-sm font-semibold text-ink-800">No roles match that filter</p>
          <button
            type="button"
            onClick={reset}
            className="mt-3 text-sm font-semibold text-brand-600 hover:underline"
          >
            Show all openings
          </button>
        </div>
      ) : (
        <motion.div layout className="mt-6 grid gap-5 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((job) => (
              <motion.div
                key={job.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                <JobCard job={job} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
