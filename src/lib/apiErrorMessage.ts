import { isAxiosError } from "axios";

// Prefer the `{ error }` message our route handlers return (see apiResponse.ts)
// over axios's generic "Request failed with status code 403".
export function apiErrorMessage(error: Error) {
  if (isAxiosError(error) && error.response?.data?.error) {
    return error.response.data.error;
  }
  return error.message;
}
