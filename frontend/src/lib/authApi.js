const DEFAULT_API_BASE_URL = "";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;

async function readResponse(response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    return await response.text();
  } catch {
    return null;
  }
}

function getErrorMessage(data, response) {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data?.errors && typeof data.errors === "object") {
    return Object.entries(data.errors)
      .flatMap(([field, messages]) => {
        const list = Array.isArray(messages) ? messages : [messages];
        return list.map((message) => `${field}: ${message}`);
      })
      .join(" ");
  }

  return (
    data?.error ??
    data?.message ??
    `${response.status} ${response.statusText || "Request failed."}`.trim()
  );
}

export async function postAuth(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await readResponse(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(data, response));
  }

  return data;
}

export async function getWithAuth(path, token) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await readResponse(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(data, response));
  }

  return data;
}

export async function putWithAuth(path, payload, token) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 204) {
    return null;
  }

  const data = await readResponse(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(data, response));
  }

  return data;
}
