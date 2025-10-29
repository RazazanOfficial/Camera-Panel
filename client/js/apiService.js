// js/apiService.js

async function parseMaybeJson(response) {
  // Some devices send incorrect content-type; read as text and try JSON.parse
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function apiGet(endpoint) {
  try {
    const response = await fetch(getAuthorizedUrl(endpoint), { method: "GET" });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        window.Auth?.clearToken?.();
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await parseMaybeJson(response);
  } catch (error) {
    console.error("Error in GET request:", error);
    throw error;
  }
}

async function apiPost(endpoint, data = {}) {
  try {
    const formData = new URLSearchParams();
    for (const key in data) {
      formData.append(key, data[key]);
    }

    const response = await fetch(getAuthorizedUrl(endpoint), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        window.Auth?.clearToken?.();
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await parseMaybeJson(response);
  } catch (error) {
    console.error("Error in POST request:", error);
    throw error;
  }
}
