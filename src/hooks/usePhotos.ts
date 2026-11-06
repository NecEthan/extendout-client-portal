"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ApiRoutes } from "@/lib/apiRoutes";
import type { ProjectPhoto } from "@/interfaces/project-photo-interface";

export function usePhotos(projectId: string) {
  return useQuery({
    queryKey: ["projects", projectId, "photos"],
    queryFn: async () => {
      const { data } = await axios.get<ProjectPhoto[]>(ApiRoutes.projects.photos(projectId));
      return data;
    },
    staleTime: 10 * 60 * 1000,
    // staleTime alone only refetches on a trigger (remount, window focus). If the tab just sits
    // open, swap in fresh URLs before the old ones expire (VIEW_URL_TTL_SECONDS in storage.ts).
    refetchInterval: 50 * 60 * 1000, // 10 mins
  });
}
