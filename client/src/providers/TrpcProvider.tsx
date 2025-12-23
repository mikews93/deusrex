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
            // Always try to get token, even if isSignedIn is false
            // Clerk might still have a token in cache
            try {
              const token = await getToken({ template: "Eden" });
              if (token) {
                return {
                  authorization: `Bearer ${token}`,
                };
              }
            } catch (error) {
              console.error('Error getting token:', error);
            }
            
            // If no token, return empty headers (will result in 401)
            return {};
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
