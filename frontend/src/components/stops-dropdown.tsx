import React, { useState, useEffect } from "react";
import stopsData from "@/stops.json"; // Adjust the path to your JSON file
import { Combobox } from "@/components/ui/combo-box"; // Adjust based on your project structure

interface Stop {
    id: string;
    stop_name: string;
    stop_lat: number;
    stop_lon: number;
}

const StopsDropdown = () => {
    // State to hold the first 10 stops
    const [stops, setStops] = useState<Stop[]>([]);

    // Load the first 10 stops
    useEffect(() => {
        const firstTenStops = stopsData.slice(0, 10);
        setStops(
            firstTenStops.map((stop) => ({
                value: stop.id, // Use `id` as the value
                label: stop.stop_name, // Use `stop_name` as the label
            }))
        );
    }, []);

    const [selectedStop, setSelectedStop] = useState<string | null>(null);

    return (
        <div className="">
            <Combobox
                options={stops}
                value={selectedStop}
                onChange={setSelectedStop}
                placeholder="Escolha um ponto..."
                virtualized={true} // Enable virtualization for larger datasets
                height={300} // Adjust height if necessary
                itemSize={40} // Adjust item height
            />
        </div>
    );
};

export default StopsDropdown;
