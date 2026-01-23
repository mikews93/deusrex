import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../../api/dist/src/modules/trpc/app.router";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3501";

export function createTRPCClientWithAuth(
  getToken: () => Promise<string | null>
) {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${API_URL}/trpc`,
        async headers() {
          const token = await getToken();
          return {
            authorization: token ? `Bearer ${token}` : "",
          };
        },
      }),
    ],
  });
}
