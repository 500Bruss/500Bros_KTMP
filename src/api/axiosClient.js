import axios from "axios";
import JSONBig from "json-bigint";
const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
  transformResponse: [(data) => {
    try {
      return JSONBig({ storeAsString: true }).parse(data);
    } catch {
      return data;
    }
  }],
});

// Attach bearer token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto refresh on 401. Backend uses same token within refreshable window.
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const existingToken = localStorage.getItem("access_token");
        if (!existingToken) throw new Error("NO_TOKEN");

        const res = await axios.post("http://localhost:8080/auth/refresh", {
          token: existingToken,
        });

        const newToken =
          res.data?.token ||
          res.data?.access_token ||
          res.data?.data?.token ||
          res.data?.data?.access_token;
        if (!newToken) throw new Error("NO_NEW_TOKEN");

        localStorage.setItem("access_token", newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (err) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("currentUser");

      }
    }

    return Promise.reject(error);
  }
);

export default api;
