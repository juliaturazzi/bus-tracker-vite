import React, {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Input} from "@/components/ui/input";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {Progress} from "@/components/ui/progress";
import * as z from "zod";
import CleanIcon from "@/images/clear-icon.png";
import CleanIconWhite from "@/images/clear-icon-white.png";
import StopsDropdown from "./stops-dropdown";
import {Slider} from "@/components/ui/slider";
import allStops from "@/stops.json"; // JSON containing the stops data
import {Switch} from "@/components/ui/switch";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {useTheme} from "@/components/theme-provider";


const schema = z
    .object({
        busLine: z.string().min(1, "Linha do ônibus é obrigatória"),
        busStop: z.coerce.string().min(1, "Ponto de ônibus é obrigatório"),
        startTime: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, "Formato de horário inválido"),
        endTime: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, "Formato de horário inválido"),
    })
    .refine((data) => data.startTime < data.endTime, {
        message: "O horário inicial deve ser anterior ao horário final",
        path: ["endTime"],
    });

type FormData = z.infer<typeof schema>;


interface FormBusTrackerProps {
    mapStop?: string; // Optional prop for the initial stop ID
    setBusData: React.Dispatch<React.SetStateAction<any[]>>;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    isLoggedIn: boolean; // Tracks user authentication
    setFormStop: React.Dispatch<React.SetStateAction<string>>;
}

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
            startTime: isLoggedIn
                ? new Date().toISOString().slice(11, 16)
                : new Date().toISOString().slice(11, 16),
            endTime: isLoggedIn
                ? new Date(new Date().getTime() + 60 * 60 * 1000).toISOString().slice(11, 16)
                : new Date(new Date().getTime() + 60 * 60 * 1000).toISOString().slice(11, 16),
        },
        mode: "onChange",
    });


    const { isValid } = form.formState;

    const [sliderValue, setSliderValue] = useState<number[]>([10]);
    const [selectedStop, setSelectedStop] = useState<string | null>(null);
    const [selectedStopName, setSelectedStopName] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isNow, setIsNow] = useState(!isLoggedIn); // Default to true for non-logged-in users.

    // Helper to get stop name
    const getStopName = (stopId: string | null): string => {
        console.log("Fetching stop name for ID:", stopId);
        const stop = allStops.find((stop) => stop.id === stopId);
        const name = stop ? stop.stop_name : "";
        console.log("Found stop name:", name);
        return name;
    };
    const getStopCoords = (stopId: string | null): { lat: string; lon: string } => {
        console.log("Fetching stop coordinates for ID:", stopId);
        const stop = allStops.find((stop) => stop.id === stopId);
        const coords = stop ? {lat: stop.stop_lat, lon: stop.stop_lon} : {lat: '0.0', lon: '0.0'};
        console.log("Found stop coordinates:", coords);
        return coords;
    };

    // Effect to handle initial stop based on mapStop
    useEffect(() => {
        if (mapStop) {
            console.log("Initial mapStop provided:", mapStop);
            const stopName = getStopName(mapStop);
            setSelectedStop(mapStop);
            setSelectedStopName(stopName);
            form.setValue("busStop", stopName);
        }
    }, [mapStop, form]);

    // Watch all form fields for changes
    const watchAllFields = form.watch();

    useEffect(() => {
        console.log("Form state changed. Validity:", isValid ? "✅ Valid" : "❌ Invalid");
        console.log("Current form values:", form.getValues());
        console.log("Errors:", form.formState.errors);
    }, [isValid, watchAllFields]);


    const {theme} = useTheme();
    const onSubmit = async (data: FormData) => {
        console.log("Submitting form with data:", data);
        setIsLoading(true);

        // Determine start and end times
        const startTime = isLoggedIn ? data.startTime : new Date().toISOString().slice(11, 16);
        const endTime = isLoggedIn
            ? data.endTime
            : new Date(new Date().getTime() + 60 * 60 * 1000).toISOString().slice(11, 16);

        // Get bus stop coordinates
        const { lat, lon } = getStopCoords(selectedStop);
        const processedFormData = {
            bus_line: data.busLine, // Adjust field names to match the backend Pydantic model
            stop_name: selectedStopName || "",
            latitude: parseFloat(lat) || 0, // Ensure correct data type
            longitude: parseFloat(lon) || 0,
            start_time: startTime, // Already set earlier
            end_time: endTime,     // Already set earlier
        };

        console.log("Processed form data for submission:", processedFormData);
        setFormData(processedFormData);
        console.log("Data being sent to the server:", JSON.stringify(processedFormData));

        if (isLoggedIn) {
            // User is logged in: Register the stop and possibly handle additional logic
            try {
                const token = localStorage.getItem("authToken");
                const response = await fetch("http://localhost:8000/stops/register/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`, // Include the token
                    },
                    body: JSON.stringify(processedFormData),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log("Successfully registered stop:", result);
                // Optionally, you might want to inform the user of successful registration
                // For example, display a success message or update UI accordingly
            } catch (error) {
                console.error("Error registering bus stop:", error);
                // Optionally, display an error message to the user
            } finally {
                setIsLoading(false);
            }
        } else {
            // User is not logged in: Fetch travel times
            try {
                // Construct query parameters
                const queryParams = new URLSearchParams({
                    bus_line: processedFormData.bus_line,
                    stop_name: processedFormData.stop_name,
                    latitude: processedFormData.latitude.toString(),
                    longitude: processedFormData.longitude.toString(),
                    start_time: processedFormData.start_time,
                    end_time: processedFormData.end_time,
                });

                const url = `http://localhost:8000/travel_times/?${queryParams.toString()}`;

                const response = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        // No Authorization header needed since the user is logged out
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log("Received travel times data from API:", data);

                setBusData(data.buses);
            } catch (error) {
                console.error("Error fetching travel times:", error);
                // Optionally, display an error message to the user
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    console.log("Form submit triggered. Form errors:", form.formState.errors);
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
                                <Input
                                    placeholder="Ex: 123"
                                    {...field}
                                    onChange={(e) => {
                                        console.log("Bus line changed:", e.target.value);
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
                                console.log("Stop dropdown changed. Selected ID:", stopId);
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
                                                    console.log("Start time changed:", e.target.value);
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
                                                    console.log("End time changed:", e.target.value);
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
                                    }}
                                    defaultValue={[10]}
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
                                        console.log("Switch state changed. Is Now:", checked);
                                        setIsNow(checked);
                                    }}
                                />
                                <FormLabel className="ml-3">Usar horário atual</FormLabel>
                            </FormItem>
                        )}
                    />
                )}

                <div className="flex space-x-4">
                    <Button
                        type="button"
                        className="gap-2 text-sm py-2 px-4 flex items-center"
                        onClick={() => {
                            console.log("Resetting form...");
                            form.reset({ busStop: mapStop || "" });
                            setSelectedStop(mapStop || null);
                            setSelectedStopName(getStopName(mapStop || null));
                            setSliderValue([10]);
                            setIsNow(!isLoggedIn);
                        }}
                    >
                        <img src={theme === 'light'? CleanIconWhite : CleanIcon} className="w-4 h-4" alt="Icon" />
                        Limpar campos
                    </Button>
                    <Button
                        type="submit"
                        className={`text-sm py-2 px-4 flex items-center ${!isValid ? "disabled:opacity-50" : ""}`}
                        disabled={!isValid}
                    >
                        Enviar
                    </Button>


                </div>
            </form>
        </Form>
    );
};

export default FormBusTracker;

