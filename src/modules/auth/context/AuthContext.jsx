import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../../../api/auth.api";

export const AuthContext = createContext(null);

// Decode JWT payload (best-effort; no signature verification)
function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    const scope = decoded.scope || "";
    const roles = scope.split(" ").filter(Boolean);
    return {
      id: decoded.sub ? Number(decoded.sub) : undefined,
      scope,
      roles,
    };
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(undefined); // undefined: loading

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const stored = localStorage.getItem("currentUser");
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        const username = stored ? JSON.parse(stored).username : undefined;
        setCurrentUser({
          id: decoded.id,
          username,
          roles: decoded.roles,
          role: decoded.roles?.includes("ADMIN") ? "ADMIN" : "USER",
          token,
        });
        return;
      }
    }
    setCurrentUser(null);
  }, []);

  const login = async (username, password) => {
    const res = await authApi.login({ username, password });
    const token =
      res.data?.token || res.data?.access_token || res.data?.data?.token;
    if (!token) throw new Error("No token received");

    localStorage.setItem("access_token", token);
    localStorage.setItem("currentUser", JSON.stringify({ username }));

    const decoded = decodeToken(token);
    const user = {
      id: decoded?.id,
      username,
      roles: decoded?.roles || [],
      role: decoded?.roles?.includes("ADMIN") ? "ADMIN" : "USER",
      token,
    };
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  };

  if (currentUser === undefined) return null; // wait for init

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
