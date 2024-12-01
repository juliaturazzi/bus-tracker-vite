import React, { useState } from "react";
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

  const handleRegister = async () => {
    setIsLoading(true);
    setError(null);

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

      setIsRegisterMode(false);
    } catch (err: any) {
      setError(err.message || "An error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

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
    console.log("Using without login");
    onClose();
  };

  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isRegisterMode ? "Register" : "Log In"}</DialogTitle>
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
            {isRegisterMode && (
                <div className="grid gap-2">
                  <Label htmlFor="password">Usuário</Label>
                  <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isLoading}
                  />
                </div>
            )}
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
            <Button
                type="button"
                className="gap-2 text-sm py-2 px-4 flex items-center"
                onClick={() => setIsRegisterMode(!isRegisterMode)}
            >
              {isRegisterMode ? "Já possui conta?" : "Criar conta?"}
            </Button>
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
  );
}
