import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getAuth } from "firebase/auth";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined
): Promise<Response> {
  // Get current Firebase user's ID and token
  const auth = getAuth();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-user-uid": auth.currentUser?.uid || "", // Always include uid header, empty if not logged in
  };

  if (process.env.NODE_ENV === "development") {
    // In development, also send the email for testing purposes
    headers["x-dev-user-email"] = auth.currentUser?.email || "";
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const auth = getAuth();
    const headers: Record<string, string> = {
      "x-user-uid": auth.currentUser?.uid || "", // Always include uid header, empty if not logged in
    };

    if (process.env.NODE_ENV === "development") {
      // In development, also send the email for testing purposes
      headers["x-dev-user-email"] = auth.currentUser?.email || "";
    }

    const res = await fetch(queryKey[0] as string, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
