const API_BASE =
  process.env.REACT_APP_API_BASE ||
  "http://127.0.0.1:5001/api";

function getToken() {
  return localStorage.getItem("phoenixToken");
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
  } catch (err) {
    const networkError = new Error("Network error. Please check backend connection.");
    networkError.code = "NETWORK_ERROR";
    throw networkError;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const httpError = new Error(data.message || "Request failed");
    httpError.status = res.status;
    throw httpError;
  }
  return data;
}

export const api = {
  request,
  get: (path) => request(path),
  post: (path, body) =>
    request(path, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  put: (path, body) =>
    request(path, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  patch: (path, body) =>
    request(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  delete: (path) =>
    request(path, {
      method: "DELETE",
    }),
};
