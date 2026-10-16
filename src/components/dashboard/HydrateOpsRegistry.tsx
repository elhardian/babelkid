"use client";

import { useEffect } from "react";
import { registry } from "@/lib/runtime-registry";
import type {
  PresenceRecord,
  SchoolEvent,
  StudentReport,
  TuitionRecord,
} from "@/lib/types";

/** Syncs ops datasets into the client registry for pages that still use helpers. */
export function HydrateOpsRegistry({
  presence,
  tuition,
  reports,
  events,
}: {
  presence: PresenceRecord[];
  tuition: TuitionRecord[];
  reports: StudentReport[];
  events: SchoolEvent[];
}) {
  useEffect(() => {
    registry.presence = presence;
    registry.tuition = tuition;
    registry.reports = reports;
    registry.events = events;
  }, [presence, tuition, reports, events]);

  // Sync during render for first paint helpers
  registry.presence = presence;
  registry.tuition = tuition;
  registry.reports = reports;
  registry.events = events;

  return null;
}
