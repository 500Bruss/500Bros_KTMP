import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../../../api/auth.api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user từ localStorage
    useEffect(() => {
        const user = localStorage.getItem("user");
        if (user) setCurrentUser(JSON.parse(user));
        setLoading(false); // 🔥 Quan trọng!
    }, []);

    const login = async (username, password) => {
        const res = await authApi.login({ username, password });

        localStorage.setItem("access_token", res.data.token);
        localStorage.setItem("user", JSON.stringify({ username }));

        setCurrentUser({ username });

        return { username };
    };



    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("access_token");
        setCurrentUser(null);
    };

    if (loading) return null; // 🔥 Quan trọng để NGĂN APP render sớm

    return (
        <AuthContext.Provider value={{ currentUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
