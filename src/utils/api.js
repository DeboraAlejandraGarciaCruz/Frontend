// utils/api.js
export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("adminToken");
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }), //si es FormData, no forzamos Content-Type
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`http://localhost:5000${endpoint}`, {
    ...options,
    headers,
    body: isFormData
      ? options.body
      : options.body
      ? JSON.stringify(options.body)
      : undefined,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText}`);
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
}
