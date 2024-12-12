import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeProvider } from "@/components/theme-provider";

const ResetPassword: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [token, setToken] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Extrai o token da query string
        const queryParams = new URLSearchParams(location.search);
        const tokenParam = queryParams.get('token');
        setToken(tokenParam);
    }, [location.search]);

    const isValidPassword = (password: string): boolean => {
        // Implemente aqui sua lógica de validação de senha
        return password.length >= 6;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!token) {
            setError('Token inválido ou ausente.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        if (!isValidPassword(newPassword)) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8000/reset-password/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    new_password: newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Falha ao redefinir a senha.');
            }

            setSuccess('Sua senha foi redefinida com sucesso! Redirecionando para o login...');
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro ao redefinir a senha.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ThemeProvider storageKey="vite-ui-theme">
        <div className="flex items-center justify-center min-h-screen">
            <div className="p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl mb-4">Redefinir Senha</h2>
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
                        <Label htmlFor="newPassword">Nova Senha</Label>
                        <Input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
                    </Button>
                </form>
            </div>
        </div>
        </ThemeProvider>
    );
};

export default ResetPassword;
