import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import * as z from "zod";
import CleanIcon from "@/images/clear-icon.png";
import CleanIconWhite from "@/images/clear-icon-white.png";
import StopsDropdown from "./stops-dropdown";
import { Slider } from "@/components/ui/slider";
import allStops from "@/stops.json"; // JSON containing the stops data
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/theme-provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Define the validation schema using Zod
const schema = z
    .object({
        busLine: z.string().min(1, "Linha do ônibus é obrigatória"),
        busStop: z.coerce.string().min(1, "Ponto de ônibus é obrigatório"),
        startTime: z
            .string()
            .regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, "Formato de horário inválido"),
        endTime: z
            .string()
            .regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, "Formato de horário inválido"),
        distance: z.number().min(1, "Distância é obrigatória"),
    })
    .refine((data) => data.startTime < data.endTime, {
        message: "O horário inicial deve ser anterior ao horário final",
        path: ["endTime"],
    });

// Infer the form data type from the schema
type FormData = z.infer<typeof schema>;

// Helper function to get local time with an optional offset
const getLocalTimeWithOffset = (offsetHours: number = 0) => {
    const now = new Date();
    now.setHours(now.getHours() + offsetHours); // Add offset in hours
    const options: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "America/Sao_Paulo",
    };
    return new Intl.DateTimeFormat("pt-BR", options).format(now);
};

// Define the component's props interface
interface FormBusTrackerProps {
    mapStop?: string; // Optional prop for the initial stop ID
    setBusData: React.Dispatch<React.SetStateAction<any[]>>;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    isLoggedIn: boolean; // Tracks user authentication
    setFormStop: React.Dispatch<React.SetStateAction<string>>;
}

const API_BASE_URL =  "http://localhost:8000";

const FormBusTracker: React.FC<FormBusTrackerProps> = ({
                                                           isLoggedIn,
                                                           mapStop,
                                                           setBusData,
                                                           setFormData,
                                                           setFormStop,
                                                       }) => {
    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            busLine: "",
            busStop: mapStop || "",
            startTime: isLoggedIn ? "" : getLocalTimeWithOffset(),
            endTime: isLoggedIn ? "" : getLocalTimeWithOffset(1),
            distance: 10, // Default distance
        },
        mode: "onChange",
    });

    const { isValid } = form.formState;

    const [sliderValue, setSliderValue] = useState<number[]>([form.getValues("distance") || 10]);

    const [selectedStop, setSelectedStop] = useState<string | null>(null);
    const [selectedStopName, setSelectedStopName] = useState<string | null>(null);
    const [isNow, setIsNow] = useState(!isLoggedIn); // Default to true for non-logged-in users.

    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // Optional error message state
    const [successfulRegistration, setSuccessfulRegistration] = useState(false);

    const { theme } = useTheme();

    /**
     * Simulate progress for loading indication.
     * Increments progress by 10% every 1.25 seconds until reaching 90%.
     */
    const simulateProgress = useCallback(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                const nextProgress = prev + 10; // Increment progress by 10
                if (nextProgress >= 90) {
                    clearInterval(interval); // Stop at 90%, API completion will set to 100%
                    return 90;
                }
                return nextProgress;
            });
        }, 1250); // Update progress every 1.25 seconds
    }, []);

    /**
     * Helper function to get stop name by ID.
     * @param stopId - The ID of the stop.
     * @returns The name of the stop or an empty string if not found.
     */
    const getStopName = useCallback((stopId: string | null): string => {
        console.log("Fetching stop name for ID:", stopId);
        const stop = allStops.find((stop) => stop.id === stopId);
        const name = stop ? stop.stop_name : "";
        console.log("Found stop name:", name);
        return name;
    }, []);

    /**
     * Helper function to get stop coordinates by ID.
     * @param stopId - The ID of the stop.
     * @returns An object containing latitude and longitude as strings.
     */
    const getStopCoords = useCallback(
        (stopId: string | null): { lat: string; lon: string } => {
            console.log("Fetching stop coordinates for ID:", stopId);
            const stop = allStops.find((stop) => stop.id === stopId);
            const coords = stop
                ? { lat: stop.stop_lat.toString(), lon: stop.stop_lon.toString() }
                : { lat: "0.0", lon: "0.0" };
            console.log("Found stop coordinates:", coords);
            return coords;
        },
        []
    );

    /**
     * Initialize the selected stop based on the `mapStop` prop.
     */
    useEffect(() => {
        if (mapStop) {
            console.log("Initial mapStop provided:", mapStop);
            const stopName = getStopName(mapStop);
            setSelectedStop(mapStop);
            setSelectedStopName(stopName);
            form.setValue("busStop", stopName);
        }
    }, [mapStop, getStopName, form]);

    /**
     * Watch all form fields for changes and log them for debugging.
     */
    const watchAllFields = form.watch();

    useEffect(() => {
        console.log(
            "Form state changed. Validity:",
            isValid ? "✅ Valid" : "❌ Invalid"
        );
        console.log("Current form values:", form.getValues());
        console.log("Errors:", form.formState.errors);
    }, [isValid, watchAllFields, form.formState.errors]);

    /**
     * Function to register a bus stop.
     * @param data - The processed form data.
     */
    const registerStop = useCallback(
        async (data: any): Promise<void> => {
            const token = localStorage.getItem("authToken");
            if (!token) {
                throw new Error("Authentication token not found.");
            }

            const response = await fetch(`${API_BASE_URL}/stops/register/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.detail || `HTTP error! status: ${response.status}`
                );
            }
            setSuccessfulRegistration(true);

            const result = await response.json();
            console.log("Successfully registered stop:", result);
        },
        []
    );

    /**
     * Function to fetch bus data.
     * @param data - The processed form data.
     */
    const fetchBusData = useCallback(
        async (data: any): Promise<void> => {
            const queryParams = new URLSearchParams({
                bus_line: data.bus_line,
                stop_name: data.stop_name,
                latitude: data.latitude.toString(),
                longitude: data.longitude.toString(),
                start_time: data.start_time,
                end_time: data.end_time,
                max_distance: data.distance,
            });

            const url = `${API_BASE_URL}/travel_times/?${queryParams.toString()}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.detail || `HTTP error! status: ${response.status}`
                );
            }

            const dataResponse = await response.json();
            console.log("Received travel times data from API:", dataResponse);

            setBusData(dataResponse.buses);
        },
        [setBusData]
    );

    /**
     * Main function to handle form submission.
     */
    const handleSubmit = useCallback(
        async (data: FormData) => {
            console.log("Submitting form with data:", data);
            setIsLoading(true);
            setProgress(0);
            setErrorMessage(null); // Reset any previous error messages
            simulateProgress(); // Start simulating progress

            // Determine start and end times
            const startTime = isLoggedIn
                ? data.startTime
                : getLocalTimeWithOffset();
            const endTime = isLoggedIn
                ? data.endTime
                : getLocalTimeWithOffset(1);

            // Get bus stop coordinates
            const { lat, lon } = getStopCoords(selectedStop);
            let processedFormData = {
                bus_line: data.busLine, // Adjust field names to match the backend Pydantic model
                stop_name: selectedStopName || "",
                latitude: parseFloat(lat) || 0, // Ensure correct data type
                longitude: parseFloat(lon) || 0,
                start_time: startTime, // Already set earlier
                end_time: endTime, // Already set earlier
                max_distance: data.distance,
            };

            console.log(
                "Processed form data for submission:",
                processedFormData
            );
            setFormData(processedFormData);
            console.log(
                "Data being sent to the server:",
                JSON.stringify(processedFormData)
            );

            try {
                if (isLoggedIn) {
                    // Step 1: Register the bus stop
                    await registerStop(processedFormData);
                    setProgress(50); // Update progress after registration
                }

                processedFormData.start_time = getLocalTimeWithOffset();
                processedFormData.end_time = getLocalTimeWithOffset(1);

                // Step 2: Fetch the bus data
                await fetchBusData(processedFormData);
                setProgress(100); // Update progress after fetching data
            } catch (error: any) {
                console.error("An error occurred:", error);
                setErrorMessage(
                    error.message || "An unexpected error occurred."
                );
            } finally {
                setIsLoading(false); // Operation completed
            }
        },
        [
            isLoggedIn,
            selectedStop,
            selectedStopName,
            getStopCoords,
            registerStop,
            fetchBusData,
            simulateProgress,
            setFormData,
        ]
    );

    /**
     * Helper function to reset the form to its initial state.
     */
    const resetForm = useCallback(() => {
        console.log("Resetting form...");
        form.reset({ busStop: mapStop || "" });
        setSelectedStop(mapStop || null);
        setSelectedStopName(getStopName(mapStop || null));
        setSliderValue([10]);
        setIsNow(!isLoggedIn);
        setErrorMessage(null);
        setProgress(0);
    }, [form, mapStop, getStopName, isLoggedIn]);

    return (
        <Form {...form}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    console.log(
                        "Form submit triggered. Form errors:",
                        form.formState.errors
                    );
                    form.handleSubmit(handleSubmit)(e);
                }}
                className="space-y-8"
            >
                {isLoading && (
                    <div className="w-full">
                        <span className="block mb-2 text-center text-sm">
                            Carregando ...
                        </span>
                        <Progress value={progress} className="w-full" />
                    </div>
                )}

                {/* Optional: Display error message */}
                {errorMessage && (
                    <div
                        className="w-full text-center text-red-500"
                        role="alert"
                    >
                        {errorMessage}
                    </div>
                )}

                <FormField
                    name="busLine"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Linha do ônibus</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Ex: 123"
                                    {...field}
                                    onChange={(e) => {
                                        console.log(
                                            "Bus line changed:",
                                            e.target.value
                                        );
                                        field.onChange(e); // Update form value
                                        // Trigger validation for related fields
                                        form.trigger(["busLine", "busStop"]);
                                    }}
                                />
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
                            onChange={(stopId) => {
                                console.log(
                                    "Stop dropdown changed. Selected ID:",
                                    stopId
                                );
                                const stopName = getStopName(stopId);
                                setSelectedStop(stopId);
                                setSelectedStopName(stopName);
                                setFormStop(stopName);
                                form.setValue("busStop", stopName); // Update form value
                                // Trigger validation for related fields
                                form.trigger(["busLine", "busStop"]);
                            }}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>

                {isLoggedIn && !isNow && (
                    <>
                        <div className="flex space-x-4">
                            <FormField
                                name="startTime"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Horário Inicial</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="time"
                                                {...field}
                                                onChange={(e) => {
                                                    console.log(
                                                        "Start time changed:",
                                                        e.target.value
                                                    );
                                                    field.onChange(e);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="endTime"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Horário Final</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="time"
                                                {...field}
                                                onChange={(e) => {
                                                    console.log(
                                                        "End time changed:",
                                                        e.target.value
                                                    );
                                                    field.onChange(e);
                                                }}
                                            />
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
                                        console.log("Slider value changed:", value);
                                        setSliderValue(value);
                                        form.setValue("distance", value[0], { shouldValidate: true }); // Update form value
                                        form.setValue("max_distance", value[0], { shouldValidate: true }); // Add this line
                                    }}
                                    min={1}
                                    max={60}
                                    step={1}
                                />
                                <span>{sliderValue[0]} min</span>
                            </div>
                        </FormItem>
                    </>
                )}

                {isLoggedIn && (
                    <FormField
                        name="now"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem className="w-full center">
                                <Switch
                                    checked={isNow}
                                    onCheckedChange={(checked) => {
                                        console.log(
                                            "Switch state changed. Is Now:",
                                            checked
                                        );
                                        setIsNow(checked);
                                    }}
                                />
                                <FormLabel className="ml-3">
                                    Usar horário atual
                                </FormLabel>
                            </FormItem>
                        )}
                    />
                )}

                <div className="flex space-x-4">
                    <Button
                        type="button"
                        className="gap-2 text-sm py-2 px-4 flex items-center"
                        onClick={resetForm}
                    >
                        <img
                            src={
                                theme === "light"
                                    ? CleanIconWhite
                                    : CleanIcon
                            }
                            className="w-4 h-4"
                            alt="Icon"
                        />
                        Limpar campos
                    </Button>
                    <Button
                        type="submit"
                        className={`text-sm py-2 px-4 flex items-center ${
                            !isValid ? "disabled:opacity-50" : ""
                        }`}
                        disabled={!isValid || isLoading}
                    >
                        Enviar
                    </Button>

                    {successfulRegistration && (
                        <Dialog open={successfulRegistration} onOpenChange={setSuccessfulRegistration}>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="text-center font-bold">Alerta registrado!</DialogTitle>
                                    <DialogDescription className="text-center">Aqui estão as informações do alerta cadastrado</DialogDescription>
                                </DialogHeader>
                                <p><strong>Linha do ônibus: </strong> {form.getValues().busLine}</p>
                                <p><strong>Ponto de ônibus: </strong> {form.getValues().busStop}</p>
                                <p><strong>Horário Inicial: </strong> {form.getValues().startTime}</p>
                                <p><strong>Horário Final: </strong> {form.getValues().endTime}</p>
                                <p><strong>Distância em minutos para o alerta: </strong> {form.getValues().distance}</p>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </form>
        </Form>
    );
};

export default FormBusTracker;
