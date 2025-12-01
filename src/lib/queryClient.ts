import { QueryClient, QueryFunction } from "@tanstack/react-query";
import i18n from "@/config/i18n";

const API_BASE_URL = 'http://localhost:3001';

function getLanguageHeader(): string {
  return i18n.language || "en";
}

function getAuthToken(): string | null {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed?.state?.token || null;
    }
  } catch {
    return null;
  }
  return null;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T = unknown>(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Accept-Language": getLanguageHeader(),
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }

  const fullUrl = url.startsWith('/') ? `${API_BASE_URL}${url}` : url;
  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return await res.json();
}

export async function apiRequestRaw(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Accept-Language": getLanguageHeader(),
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }

  const fullUrl = url.startsWith('/') ? `${API_BASE_URL}${url}` : url;
  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

function serializeValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

function buildUrlFromQueryKey(queryKey: readonly unknown[]): string {
  const pathParts: string[] = [];
  const queryParams = new URLSearchParams();

  for (const part of queryKey) {
    if (typeof part === 'string') {
      pathParts.push(part);
    } else if (typeof part === 'number') {
      pathParts.push(String(part));
    } else if (Array.isArray(part)) {
      part.forEach((item, index) => {
        if (item !== undefined && item !== null) {
          queryParams.append(String(index), serializeValue(item));
        }
      });
    } else if (part && typeof part === 'object') {
      for (const [key, value] of Object.entries(part)) {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object' && !(value instanceof Date)) {
            queryParams.append(key, JSON.stringify(value));
          } else {
            queryParams.append(key, serializeValue(value));
          }
        }
      }
    }
  }

  let url = pathParts.join('/');
  const queryString = queryParams.toString();
  if (queryString) {
    const separator = url.includes('?') ? '&' : '?';
    url += `${separator}${queryString}`;
  }
  return url;
}

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = getAuthToken();
    const url = buildUrlFromQueryKey(queryKey);
    const fullUrl = url.startsWith('/') ? `${API_BASE_URL}${url}` : url;
    const res = await fetch(fullUrl, {
      credentials: "include",
      headers: {
        "Accept-Language": getLanguageHeader(),
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
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
