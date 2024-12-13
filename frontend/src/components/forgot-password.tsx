import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeProvider } from "@/components/theme-provider";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DialogHeader } from "./ui/dialog";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!isValidEmail(email)) {
            setError("Por favor, insira um email válido.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:8000/request-password-reset/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Falha ao solicitar a redefinição de senha.");
            }

            setSuccess("Se o email estiver registrado, um link de redefinição de senha foi enviado.");
        } catch (err) {
            setError(err.message || "Ocorreu um erro.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ThemeProvider storageKey="vite-ui-theme">
            <Dialog open={true}>    
                <DialogContent className="sm:max-w-md" showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle>Solicitar Redefinição de Senha</DialogTitle>
                        </DialogHeader>

                {success && (
                    <div className="mb-4 p-4 bg-green-200 text-green-800 rounded">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="mb-4 p-4 bg-red-200 text-red-800 rounded">
                        {error}
                    </div>
                )}
               
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? "Enviando..." : "Enviar Link de Redefinição"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
        </ThemeProvider>
    );
};

export default ForgotPassword;
