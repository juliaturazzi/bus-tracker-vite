import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

const RegisteredStops = ({ onClose }: { onClose: () => void }) => {
    const [stops, setStops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(true); 

    useEffect(() => {
        const fetchStops = async () => {
            try {
                const token = localStorage.getItem("authToken");
                if (!token) {
                    throw new Error("No authentication token found.");
                }

                const response = await fetch("http://localhost:8000/stops/registered/", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
                }


                const data = await response.json();
                console.log("Data received: ", data);
                setStops(data);
            } catch (err) {
                setError((err as Error).message || "Erro ao consultar pontos cadastrados.");
            } finally {
                setLoading(false);
            }
        };

        fetchStops();
    }, []);

    const handleDelete = async (stop: any) => {
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                throw new Error("Token de autenticação não encontrado.");
            }

            const response = await fetch("http://localhost:8000/stops/registered/", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(stop),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            setStops((prevStops) =>
                prevStops.filter(
                    (s) =>
                        !(
                            s.stop_name === stop.stop_name &&
                            s.latitude === stop.latitude &&
                            s.longitude === stop.longitude &&
                            s.start_time === stop.start_time &&
                            s.end_time === stop.end_time
                        )
                )
            );
        } catch (err) {
            alert(`Erro ao deletar ponto: ${(err as Error).message}`);
        }
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) onClose(); 
        }}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Alertas cadastrados</DialogTitle>
                </DialogHeader>
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-40 w-full" />
                    </div>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : stops.length === 0 ? (
                    <p>Você não possui alertas cadastrados.</p>
                ) : (
                    <Table className="mt-4">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Linha</TableHead>
                                <TableHead>Ponto de ônibus</TableHead>
                                <TableHead>Latitude</TableHead>
                                <TableHead>Longitude</TableHead>
                                <TableHead>Começo</TableHead>
                                <TableHead>Fim</TableHead>
                                <TableHead>Distância</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stops.map((stop, index) => (
                                <TableRow key={index}>
                                    <TableCell>{stop.bus_line}</TableCell>
                                    <TableCell>{stop.stop_name}</TableCell>
                                    <TableCell>{stop.latitude}</TableCell>
                                    <TableCell>{stop.longitude}</TableCell>
                                    <TableCell>{stop.start_time}</TableCell>
                                    <TableCell>{stop.end_time}</TableCell>
                                    <TableCell>{stop.max_distance}</TableCell>
                                    <TableCell>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive">Delete</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <p>Tem certeza que deseja excluir este alerta?</p>
                                                <div className="mt-4 flex justify-end gap-2">
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(stop)}>
                                                        Excluir
                                                    </AlertDialogAction>
                                                </div>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default RegisteredStops;
