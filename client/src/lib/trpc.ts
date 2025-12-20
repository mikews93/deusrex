import { createTRPCReact } from "@trpc/react-query";
import type { inferRouterOutputs, inferRouterInputs } from "@trpc/server";

// Import the AppRouter type from the built API
import type { AppRouter } from "../../../api/dist/src/modules/trpc/app.router";

export const trpc = createTRPCReact<AppRouter>();

// Export types for use in components
export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type RouterInputs = inferRouterInputs<AppRouter>;
