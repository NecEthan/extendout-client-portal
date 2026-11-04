"use client";

import { useMutation } from "@tanstack/react-query";
import { ApiRoutes } from "@/lib/apiRoutes";
import axios from "axios";
import type { CompletePasswordChangeResponse } from "@/interfaces/account-interface";

export function useCompletePasswordChange() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await axios.post<CompletePasswordChangeResponse>(ApiRoutes.auth.completePasswordChange);
      return data;
    },
  });
}
