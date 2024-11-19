import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import * as z from "zod";
import CleanIcon from "@/images/clear-icon.svg";
import StopsDropdown from "./stops-dropdown";
import { Slider } from "@/components/ui/slider";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const schema = z
    .object({
        busLine: z.string().min(1, "Linha do ônibus é obrigatória"),
        busStop: z.coerce.string().min(1, "Ponto de ônibus é obrigatório"), // Automatically converts number to string
        startTime: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, "Formato de horário inválido"),
        endTime: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, "Formato de horário inválido"),
    })
    .refine((data) => data.startTime < data.endTime, {
        message: "O horário inicial deve ser anterior ao horário final",
        path: ["endTime"],
    });

type FormData = z.infer<typeof schema>;

interface FormBusTrackerProps {
    setBusData: React.Dispatch<React.SetStateAction<any[]>>;
}

const FormBusTracker: React.FC<FormBusTrackerProps> = ({ setBusData }) => {
    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            busLine: "",
            busStop: "",
            startTime: "",
            endTime: "",
        },
    });

    const [sliderValue, setSliderValue] = useState<number[]>([10]);
    const [selectedStop, setSelectedStop] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const watchAllFields = form.watch();

    const onSubmit = async (data: FormData) => {
        console.log("Form data before processing:", data);
        setIsLoading(true);

        const formData = {
            ...data,
            busStop: selectedStop || "",
            distanceTime: sliderValue[0],
        };

        console.log("FormData sent to API:", formData);

        try {
            const response = await fetch("http://127.0.0.1:8000/api/bus-data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const buses = await response.json();
            console.log("Buses Data received from API:", buses);
            setBusData(buses);
        } catch (error) {
            console.error("Failed to fetch bus data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={(e) => {
                    console.log("Submit event triggered");
                    e.preventDefault();
                    console.log("Form errors:", form.formState.errors); // Log form errors here
                    form.handleSubmit(onSubmit)(e);
                }}
                className="space-y-8"
            >
                {isLoading && <Progress value={50} className="w-full" />}
                <FormField
                    name="busLine"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Linha do ônibus</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: 123" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormItem>
                    <FormLabel>Ponto de ônibus</FormLabel>
                    <FormControl>
                        <StopsDropdown
                            value={selectedStop}
                            onChange={(value) => {
                                console.log("Selected Stop changed to:", value);
                                setSelectedStop(value);
                                form.setValue("busStop", value || "");
                            }}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                <div className="flex space-x-4">
                    <FormField
                        name="startTime"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Horário Inicial</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="endTime"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Horário Final</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormItem>
                    <FormLabel>Distância do ônibus (em minutos)</FormLabel>
                    <div className="flex items-center space-x-4 text-sm">
                        <Slider
                            value={sliderValue}
                            onValueChange={(value) => {
                                console.log("Slider value changed to:", value);
                                setSliderValue(value);
                            }}
                            defaultValue={[10]}
                            min={1}
                            max={60}
                            step={1}
                        />
                        <span>{sliderValue[0]} min</span>
                    </div>
                </FormItem>
                <div className="flex space-x-4">
                    <Button
                        type="button"
                        className="gap-2 text-sm py-2 px-4 flex items-center"
                        onClick={() => {
                            console.log("Resetting form");
                            form.reset();
                            setSelectedStop(null);
                            setSliderValue([10]);
                        }}
                    >
                        <img src={CleanIcon} className="w-4 h-4" alt="Icon" />
                        Limpar campos
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger>
                            <Button type="submit" className="text-sm py-2 px-4 flex items-center">
                                Enviar
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Alerta cadastrado com sucesso!</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Linha de ônibus: {watchAllFields.busLine || "Não informado"} <br />
                                    Ponto de ônibus: {watchAllFields.busStop || "Não informado"} <br />
                                    Horário Inicial: {watchAllFields.startTime || "Não informado"} <br />
                                    Horário Final: {watchAllFields.endTime || "Não informado"} <br />
                                    Distância do ônibus (em minutos): {sliderValue[0]}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogAction>Ver alerta</AlertDialogAction>
                                <AlertDialogCancel>Fechar</AlertDialogCancel>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </form>
        </Form>
    );
};

export default FormBusTracker;
