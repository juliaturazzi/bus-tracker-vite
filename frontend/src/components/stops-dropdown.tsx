import { useState, useEffect, forwardRef } from "react";
import stopsData from "@/stops.json"; 
import { Combobox } from "@/components/ui/combo-box"; 

interface StopsDropdownProps {
    onChange: (value: string | null) => void;
    value: string | null;
}

const StopsDropdown = forwardRef<HTMLDivElement, StopsDropdownProps>(
    ({ value, onChange }, ref) => {
        const [stops, setStops] = useState<{ value: string; label: string }[]>([]);

        useEffect(() => {
            console.log("Loaded stopsData:", stopsData); 
            const firstTenStops = stopsData.slice(0, stopsData.length);
            const formattedStops = firstTenStops.map((stop) => ({
                value: stop.id,
                label: stop.stop_name,
            }));
            console.log("Formatted dropdown options:", formattedStops); 
            setStops(formattedStops);
        }, []);

        return (
            <div ref={ref}>
                <Combobox
                    options={stops}
                    value={value}
                    onChange={(selectedValue) => {
                        console.log("Dropdown value selected:", selectedValue); 
                        onChange(selectedValue); 
                    }}
                    placeholder="Escolha um ponto..."
                    virtualized={true} 
                    height={300} 
                    itemSize={40} 
                />
            </div>
        );
    }
);

StopsDropdown.displayName = "StopsDropdown";

export default StopsDropdown;
