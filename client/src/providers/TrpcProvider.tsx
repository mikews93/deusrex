import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import React, { useState, useMemo } from "react";
import { trpc } from "../lib/trpc";
import { useAuth } from "@clerk/clerk-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3501";

interface TrpcProviderProps {
  children: React.ReactNode;
}

export function TrpcProvider({ children }: TrpcProviderProps) {
  const { getToken, isSignedIn } = useAuth();
  const [queryClient] = useState(() => new QueryClient());

  const trpcClient = useMemo(() => {
    return trpc.createClient({
      links: [
        httpBatchLink({
          url: `${API_URL}/trpc`,
          async headers() {
            if (!isSignedIn) {
              return {};
            }

            // Get the JWT token using the "Eden" template
            const token = await getToken({ template: "Eden" });
            return {
              authorization: token ? `Bearer ${token}` : "",
            };
          },
        }),
      ],
    });
  }, [getToken, isSignedIn]);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
