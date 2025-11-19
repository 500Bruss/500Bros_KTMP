import { createContext, useContext, useState } from "react";
import { authApi } from "../../../api/auth.api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(
        JSON.parse(localStorage.getItem("user")) || null
    );

    const login = async (username, password) => {
        const res = await authApi.login({ username, password });

        localStorage.setItem("access_token", res.data.token);
        localStorage.setItem("user", JSON.stringify({ username }));
        setCurrentUser({ username });
        return { username };
    };


    const logout = () => {
        localStorage.clear();
        setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
