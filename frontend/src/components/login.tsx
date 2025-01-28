import {useState, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {useAuth} from "@/components/auth_context";
import {useNavigate} from "react-router-dom";

interface AuthDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthDialog({isOpen, onClose}: AuthDialogProps) {
    const {logIn} = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [resetEmail, setResetEmail] = useState("");

    const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const getQueryParams = () => {
        return new URLSearchParams(window.location.search);
    };

    const handleVerification = async (token: string) => {
        setIsVerifying(true);
        setVerificationMessage(null);
        setError(null);

        try {
            const response = await fetch(`https://api.bustracker.com.br/verify/?token=${token}`, {
                method: "GET",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Falha na verificação.");
            }

            setVerificationMessage(data.message || "Email verificado com sucesso!");
            setIsSuccess(true);
        } catch (err: any) {
            setError(err.message || "Ocorreu um erro durante a verificação.");
        } finally {
            setIsVerifying(false);
        }
    };

    useEffect(() => {
        const query = getQueryParams();
        const token = query.get("token");

        if (token && isOpen) {
            handleVerification(token);
            const url = new URL(window.location.href);
            url.searchParams.delete("token");
            window.history.replaceState({}, document.title, url.toString());
        }
    }, [isOpen]);

    const handleRegister = async () => {
        setIsLoading(true);
        setError(null);
        setVerificationMessage(null);

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
            const response = await fetch("https://api.bustracker.com.br/register/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({email, username, password}),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Falha ao registrar o usuário.");
            }

            setIsSuccess(true);
            setVerificationMessage("Cadastro realizado com sucesso! Por favor, verifique seu email para ativar sua conta.");
            setTimeout(() => {
                setIsSuccess(false);
                setIsRegisterMode(false);
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Ocorreu um erro durante o registro.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (email) {
            setUsername(email);
        }
    }, [email]);

    const handleLogin = async () => {
        setIsLoading(true);
        setError(null);
        setVerificationMessage(null);

        try {
            const response = await fetch("https://api.bustracker.com.br/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({username: email, password}),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.detail.includes("Email not verified")) {
                    throw new Error("Email não verificado. Por favor, verifique seu email.");
                } else {
                    throw new Error(data.detail || "Credenciais de login inválidas.");
                }
            }

            logIn(data.access_token, email);
            onClose();
        } catch (err: any) {
            setError(err.message || "Ocorreu um erro durante o login.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setIsLoading(true);
        setError(null);
        setVerificationMessage(null);

        try {
            const response = await fetch("https://api.bustracker.com.br/resend-verification/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({email}),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Falha ao reenviar o email de verificação.");
            }

            setVerificationMessage("Email de verificação reenviado! Por favor, verifique seu email.");
        } catch (err: any) {
            setError(err.message || "Ocorreu um erro ao reenviar o email de verificação.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordResetRequest = async () => {
        setIsLoading(true);
        setError(null);
        setVerificationMessage(null);

        if (!isValidEmail(resetEmail)) {
            setError("Por favor, insira um email válido.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("https://api.bustracker.com.br/request-password-reset/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({email: resetEmail}),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Falha ao solicitar a redefinição de senha.");
            }

            setVerificationMessage("Se o email estiver registrado, um link de redefinição de senha foi enviado.");
            setIsForgotPasswordMode(false);
        } catch (err: any) {
            setError(err.message || "Ocorreu um erro durante a solicitação.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = () => {
        if (isForgotPasswordMode) {
            handlePasswordResetRequest();
        } else if (isRegisterMode) {
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
        setVerificationMessage(null);
        setIsForgotPasswordMode(false);
    }

    const handleForgotPasswordNavigation = () => {
        onClose(); // Fechar o diálogo de autenticação
        navigate("/forgot-password"); // Redirecionar para a página de solicitação de redefinição
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="w-full max-w-lg p-4 sm:p-6 lg:max-w-md" showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle className="text-xl sm:text-2xl">
                            {isRegisterMode
                                ? "Cadastre-se"
                                : isForgotPasswordMode
                                    ? "Recuperar Senha"
                                    : "Bem-vindo de volta!"}
                        </DialogTitle>
                        <DialogDescription className="text-sm sm:text-base">
                            {isRegisterMode
                                ? "Crie uma nova conta preenchendo os campos abaixo."
                                : isForgotPasswordMode
                                    ? "Insira seu email para receber um link de redefinição de senha."
                                    : "Digite seu email e senha para fazer login."}
                        </DialogDescription>
                    </DialogHeader>

                    {verificationMessage && (
                        <div className="mb-4 p-4 rounded-md border border-green-300 bg-green-200 text-green-800">
                            {verificationMessage}
                        </div>
                    )}

                    {error && (
                        <div
                            className="mb-4 p-4 rounded-md border border-red-300 bg-red-200 text-red-800 flex flex-col items-center gap-2">
                            <span className="text-center">{error}</span>
                            {error.includes("Email não verificado") && (
                                <span
                                    onClick={handleResendVerification}
                                    className="text-red-500 cursor-pointer hover:underline"
                                >
                                    Reenviar Verificação
                                </span>
                            )}
                        </div>
                    )}

                    {!isForgotPasswordMode ? (
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full"
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
                                    className="w-full"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="reset-email">Email</Label>
                                <Input
                                    id="reset-email"
                                    type="email"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:justify-between space-y-2 sm:space-y-0 sm:space-x-4 mt-2">
                        {!isForgotPasswordMode && (
                            <span
                                onClick={toggleMode}
                                className="text-blue-500 cursor-pointer hover:underline text-center sm:text-left"
                            >
                                {isRegisterMode
                                    ? "Já possui conta? Entre aqui!"
                                    : "Não possui conta? Crie uma aqui!"}
                            </span>
                        )}
                        {isForgotPasswordMode && (
                            <span
                                onClick={() => setIsForgotPasswordMode(false)}
                                className="text-blue-500 cursor-pointer hover:underline text-center sm:text-left"
                            >
                                Voltar para o login
                            </span>
                        )}
                    </div>

                    {!isForgotPasswordMode && (
                        <div className="flex justify-center sm:justify-end mt-2">
                            <span
                                onClick={handleForgotPasswordNavigation}
                                className="text-blue-500 cursor-pointer hover:underline text-center sm:text-right"
                            >
                                Esqueceu sua senha?
                            </span>
                        </div>
                    )}

                    <DialogFooter className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <Button onClick={handleSubmit} disabled={isLoading} className="w-full sm:w-auto">
                            {isLoading
                                ? isRegisterMode
                                    ? "Cadastrando..."
                                    : isForgotPasswordMode
                                        ? "Enviando..."
                                        : "Fazendo login..."
                                : isRegisterMode
                                    ? "Cadastrar"
                                    : isForgotPasswordMode
                                        ? "Enviar Solicitação"
                                        : "Log In"}
                        </Button>
                        <Button type="button" variant="secondary" onClick={handleUseWithoutLogin} className="w-full sm:w-auto">
                            Entrar sem login
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {isVerifying && (
                <Dialog open={isVerifying}>
                    <DialogContent className="w-full max-w-sm p-4 sm:p-6" showCloseButton={false}>
                        <DialogHeader>
                            <DialogTitle className="text-xl sm:text-2xl">Verificando...</DialogTitle>
                        </DialogHeader>
                        <p className="text-center">Aguarde enquanto verificamos seu email.</p>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
