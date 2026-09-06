"use client";

import { useEffect } from "react";
import { recordProjectView } from "@/server/actions/analytics";

interface ProjectViewTrackerProps {
  projectId: string;
}

export function ProjectViewTracker({ projectId }: ProjectViewTrackerProps) {
  useEffect(() => {
    // Disparo no bloqueante
    recordProjectView(projectId);
  }, [projectId]);

  return null;
}
