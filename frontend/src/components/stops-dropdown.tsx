import React, { useState, useEffect, forwardRef } from "react";
import stopsData from "@/stops.json"; // Adjust the path to your JSON file
import { Combobox } from "@/components/ui/combo-box"; // Adjust based on your project structure

interface Stop {
    id: string;
    stop_name: string;
    stop_lat: number;
    stop_lon: number;
}

interface StopsDropdownProps {
    onChange: (value: string | null) => void;
    value: string | null;
}

const StopsDropdown = forwardRef<HTMLDivElement, StopsDropdownProps>(
    ({ value, onChange }, ref) => {
        const [stops, setStops] = useState<{ value: string; label: string }[]>([]);

<<<<<<< Updated upstream
    // Load the first 10 stops
    useEffect(() => {
        const firstTenStops = stopsData.slice(0, stopsData.length);
        setStops(
            firstTenStops.map((stop) => ({
=======
        useEffect(() => {
            console.log("Loaded stopsData:", stopsData); // Log stops data from JSON
            const firstTenStops = stopsData.slice(0, stopsData.length);
            const formattedStops = firstTenStops.map((stop) => ({
>>>>>>> Stashed changes
                value: stop.id, // Use `id` as the value
                label: stop.stop_name, // Use `stop_name` as the label
            }));
            console.log("Formatted dropdown options:", formattedStops); // Log formatted stops
            setStops(formattedStops);
        }, []);

        return (
            <div ref={ref}>
                <Combobox
                    options={stops}
                    value={value}
                    onChange={(selectedValue) => {
                        console.log("Dropdown value selected:", selectedValue); // Log selected value
                        onChange(selectedValue); // Pass value to parent
                    }}
                    placeholder="Escolha um ponto..."
                    virtualized={true} // Enable virtualization for larger datasets
                    height={300} // Adjust height if necessary
                    itemSize={40} // Adjust item height
                />
            </div>
        );
    }
);

StopsDropdown.displayName = "StopsDropdown";

export default StopsDropdown;
