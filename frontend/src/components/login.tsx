import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth_context";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const { logIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // Success state

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    setIsLoading(true);
    setError(null);

    if (!isValidEmail(email)) {
      setError("Por favor, insira um email válido.");
      setIsLoading(false);
      return;
    }

    if (!password || password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to register user.");
      }

      setIsSuccess(true); // Show success popup
      setTimeout(() => {
        setIsSuccess(false); // Hide popup
        setIsRegisterMode(false); // Switch to login mode
      }, 1500); // 1.5-second delay
    } catch (err: any) {
      setError(err.message || "An error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (email) {
      setUsername(email);
    }
  } , [email]);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ username: email, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid login credentials.");
      }

      const data = await response.json();
      logIn(data.access_token, email);
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (isRegisterMode) {
      handleRegister();
    } else {
      handleLogin();
    }
  };

  const handleUseWithoutLogin = () => {
    onClose();
  };

  function toggleMode() {
    setIsRegisterMode((prevMode) => !prevMode);
    setError(null);
  }
  return (
      <>
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-md" showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>{isRegisterMode ? "Cadastrar" : "Log In"}</DialogTitle>
              <DialogDescription>
                {isRegisterMode
                    ? "Crie uma nova conta preenchendo os campos abaixo."
                    : "Digite seu nome de usuário e senha para fazer login."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                />
              </div>
            </div>
            <div className="flex space-x-4">
            <span
              onClick={toggleMode}
              className="text-blue-500 cursor-pointer hover:underline"
            >
              {isRegisterMode ? "Já possui conta? Entre aqui!" : "Não possui conta? Crie uma aqui!"}
            </span>
            </div>
            {error && <div className="text-red-500 mt-2">{error}</div>}
            <DialogFooter>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading
                    ? isRegisterMode
                        ? "Cadastrando..."
                        : "Fazendo login..."
                    : isRegisterMode
                        ? "Cadastrar"
                        : "Log In"}
              </Button>
              <Button type="button" variant="secondary" onClick={handleUseWithoutLogin}>
                Entrar sem login
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success Popup */}
        {isSuccess && (
            <Dialog open={isSuccess}>
              <DialogContent  showCloseButton={false}>
                <DialogHeader>
                  <DialogTitle>Sucesso!</DialogTitle>
                </DialogHeader>
                <p>Cadastro realizado com sucesso! Redirecionando para login...</p>
              </DialogContent>
            </Dialog>
        )}
      </>
  );
}
