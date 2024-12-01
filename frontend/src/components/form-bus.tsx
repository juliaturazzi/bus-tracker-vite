import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import allStops from "@/stops.json";
import * as z from "zod";

// Validation schema
const schema = z
    .object({
        busLine: z.string().min(1, "Linha do ônibus é obrigatória"),
        busStop: z.string().min(1, "Ponto de ônibus é obrigatório"),
        startTime: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, "Formato de horário inválido"),
        endTime: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, "Formato de horário inválido"),
    })
    .refine((data) => data.startTime < data.endTime, {
        message: "O horário inicial deve ser anterior ao horário final",
        path: ["endTime"],
    });

type FormData = z.infer<typeof schema>;

interface FormBusTrackerProps {
    isLoggedIn: boolean; // Tracks user authentication
    mapStop?: string; // Selected stop from map
    setBusData: React.Dispatch<React.SetStateAction<any[]>>;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const FormBusTracker: React.FC<FormBusTrackerProps> = ({
                                                           isLoggedIn,
                                                           mapStop,
                                                           setBusData,
                                                           setFormData,
                                                       }) => {
    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            busLine: "",
            busStop: mapStop || "",
            startTime: "",
            endTime: "",
        },
        mode: "onChange",
    });

    const [sliderValue, setSliderValue] = useState<number[]>([10]);
    const [isNow, setIsNow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Helper to get stop name by ID
    const getStopName = (stopId: string | null): string => {
        const stop = allStops.find((stop) => stop.id === stopId);
        return stop ? stop.stop_name : "";
    };

    // Sync the selected map stop with the form
    useEffect(() => {
        if (mapStop) {
            const stopName = getStopName(mapStop);
            form.setValue("busStop", stopName);
        }
    }, [mapStop, form]);

    const handleSubmit = async (data: FormData) => {
        if (!isLoggedIn) {
            alert("Please log in to submit the form.");
            return;
        }

        setIsLoading(true);

        const startTime = isNow ? new Date().toISOString().slice(11, 16) : data.startTime;
        const endTime = isNow ? new Date().toISOString().slice(11, 16) : data.endTime;

        const formData = {
            ...data,
            startTime,
            endTime,
            distanceTime: sliderValue[0],
        };

        setFormData(formData);

        try {
            const response = await fetch("http://127.0.0.1:8000/api/bus-data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const buses = await response.json();
            setBusData(buses);
        } catch (error) {
            console.error("Error fetching bus data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit(handleSubmit)(e);
                }}
                className="space-y-8"
            >
                {isLoading && <Progress value={50} className="w-full" />}

                {/* Bus Line */}
                <FormField
                    name="busLine"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Linha do ônibus</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Digite a linha do ônibus"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Bus Stop */}
                <FormField
                    name="busStop"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ponto de ônibus</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Selecione um ponto de ônibus"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Time Range */}
                {(!isNow || isLoggedIn) && (
                    <div className="flex space-x-4">
                        <FormField
                            name="startTime"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Horário inicial</FormLabel>
                                    <FormControl>
                                        <Input type="time" {...field}  />
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
                                    <FormLabel>Horário final</FormLabel>
                                    <FormControl>
                                        <Input type="time" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div> )}

                {/* Distance Slider */}
                {(isLoggedIn) && (
                <FormItem>
                    <FormLabel>Distância do ônibus (em minutos)</FormLabel>
                    <Slider
                        value={sliderValue}
                        onValueChange={setSliderValue}
                        min={1}
                        max={60}
                        step={1}
                    />
                    <div className="flex items-center justify-between text-sm mt-2">
                        <span>1 min</span>
                        <span>{sliderValue[0]} min</span>
                        <span>60 min</span>
                    </div>
                </FormItem>
                )}

                {/* "Now" Switch */}
                {(isLoggedIn) && (
                <FormItem>
                    <FormLabel>Usar horário atual</FormLabel>
                    <Switch
                        checked={isNow}
                        onCheckedChange={setIsNow}
                    />

                </FormItem> )}

                {/* Submit and Reset Buttons */}
                <div className="flex space-x-4">
                    <Button
                        type="button"
                        onClick={() => form.reset()}
                    >
                        Limpar Campos
                    </Button>
                    <Button
                        type="submit"
                    >
                        {isLoading ? "Enviando..." : "Enviar"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default FormBusTracker;
