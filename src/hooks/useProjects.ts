"use client";

import { useQuery } from "@tanstack/react-query";
import { ApiRoutes } from "@/lib/apiRoutes";
import axios from "axios";
import type { Project } from "@/interfaces/project-interface";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await axios.get<Project[]>(ApiRoutes.projects.list);
      return data;
    },
  });
}
