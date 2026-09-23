export async function apiFetch(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    credentials: "include",
    cache: "no-store",
  });

  //   console.log("Original API status:", response.status);

  if (response.status !== 401) {
    return response;
  }

  //   console.log("Access token expired. Refreshing...");

  const refreshResponse = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  });

  //   console.log("Refresh API status:", refreshResponse.status);

  if (!refreshResponse.ok) {
    return response;
  }

  //   console.log("Refresh successful. Retrying original request...");

  const retryResponse = await fetch(input, {
    ...init,
    credentials: "include",
    cache: "no-store",
  });

  //   console.log("Retry API status:", retryResponse.status);

  return retryResponse;
}
