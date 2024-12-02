import React, { createContext, useContext, useState } from "react";

interface AuthContextProps {
    isLoggedIn: boolean;
    email: string | null; 
    logIn: (token: string, email: string) => void; 
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
    const [email, setEmail] = useState<string | null>(localStorage.getItem("authEmail"));

    const logIn = (token: string, email: string) => {
        localStorage.setItem("authToken", token); 
        localStorage.setItem("authEmail", email); 
        setEmail(email); 
        setIsLoggedIn(true); 
    };

    const logOut = () => {
        localStorage.removeItem("authToken"); 
        localStorage.removeItem("authEmail"); 
        setEmail(null); 
        setIsLoggedIn(false); 
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, email, logIn, logOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
