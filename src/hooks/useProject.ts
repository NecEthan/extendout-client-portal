"use client";

import { useQuery } from "@tanstack/react-query";
import { ApiRoutes } from "@/lib/apiRoutes";
import axios from "axios";
import type { Project } from "@/interfaces/project-interface";

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ["projects", projectId],
    queryFn: async () => {
      const { data } = await axios.get<Project>(ApiRoutes.projects.get(projectId));
      return data;
    },
  });
}
