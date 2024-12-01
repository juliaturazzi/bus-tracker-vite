import React, { createContext, useContext, useState } from "react";

interface AuthContextProps {
    isLoggedIn: boolean;
    email: string | null; // Add email to the context
    logIn: (token: string, email: string) => void; // Accept a token and email when logging in
    logOut: () => void;
}

const AuthContext = createContext<AuthContextProps>({
    isLoggedIn: false,
    email: null,
    logIn: () => {},
    logOut: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("authToken"));
    const [email, setEmail] = useState<string | null>(localStorage.getItem("authEmail")); // Retrieve email from storage

    const logIn = (token: string, email: string) => {
        localStorage.setItem("authToken", token); // Store token
        localStorage.setItem("authEmail", email); // Store email
        setEmail(email); // Update email state
        setIsLoggedIn(true); // Update login state
    };

    const logOut = () => {
        localStorage.removeItem("authToken"); // Clear token
        localStorage.removeItem("authEmail"); // Clear email
        setEmail(null); // Clear email state
        setIsLoggedIn(false); // Update login state
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, email, logIn, logOut }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for consuming the context
export const useAuth = () => useContext(AuthContext);
