import {useState, useEffect, forwardRef} from "react";
import stopsData from "@/stops.json";
import {FixedSizeList as List} from "react-window";

interface StopsDropdownProps {
    onChange: (value: string | null) => void;
    value: string | null;
}

const height = 40; // Height of each item in the dropdown

// Virtualized list for dropdown options
const VirtualizedDropdown = ({
    options,
    value,
    onChange,
    closeDropdown,
    maxHeight,
}: {
    options: {value: string; label: string}[];
    value: string | null;
    onChange: (value: string) => void;
    closeDropdown: () => void;
    maxHeight: number;
}) => {
    const handleSelect = (selectedValue: string) => {
        onChange(selectedValue);
        closeDropdown(); // Close the dropdown after selection
    };

    return (
        <List
            height={maxHeight}
            itemCount={options.length}
            itemSize={height}
            width="100%"
        >
            {({index, style}) => {
                const option = options[index];
                return (
                    <div
                        className={`px-4 py-2 cursor-pointer ${value === option.value
                                ? "bg-gray-700 text-white"
                                : "bg-black text-gray-200 hover:bg-gray-800"
                            }`}
                        style={style}
                        onClick={() => handleSelect(option.value)}
                    >
                        {option.label}
                    </div>
                );
            }}
        </List>
    );
};

const StopsDropdown = forwardRef<HTMLDivElement, StopsDropdownProps>(
    ({value, onChange}, ref) => {
        const [stops, setStops] = useState<{value: string; label: string}[]>([]);
        const [search, setSearch] = useState<string>(""); // Search term
        const [filteredStops, setFilteredStops] = useState<
            {value: string; label: string}[]
        >([]);
        const [isOpen, setIsOpen] = useState<boolean>(false); // Track dropdown open/close state

        useEffect(() => {
            const formattedStops = stopsData.map((stop) => ({
                value: stop.id,
                label: stop.stop_name,
            }));
            setStops(formattedStops);
            setFilteredStops(formattedStops);
        }, []);

        // Filter stops based on search input
        useEffect(() => {
            setFilteredStops(
                stops.filter((stop) =>
                    stop.label.toLowerCase().includes(search.toLowerCase())
                )
            );
        }, [search, stops]);

        return (
            <div ref={ref} className="w-72 relative">
                {/* Search Input */}
                <div
                    className="w-full px-4 py-2 text-gray-200 bg-gray-800 rounded focus:outline-none cursor-pointer"
                    onClick={() => setIsOpen(!isOpen)} // Toggle dropdown on click
                >
                    {value ? stops.find((stop) => stop.value === value)?.label : "Select a stop"}
                </div>

                {isOpen && (
                    <div
                        className="absolute z-10 mt-2 w-full border border-gray-700 rounded bg-black"
                    >
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-4 py-2 text-gray-200 bg-gray-800 focus:outline-none"
                        />
                        <VirtualizedDropdown
                            options={filteredStops}
                            value={value}
                            onChange={(selectedValue) => {
                                onChange(selectedValue);
                                setIsOpen(false); // Close the dropdown on selection
                            }}
                            closeDropdown={() => setIsOpen(false)} // Explicitly close the dropdown
                            maxHeight={300} // Total height of the dropdown
                        />
                    </div>
                )}
            </div>
        );
    }
);

StopsDropdown.displayName = "StopsDropdown";

export default StopsDropdown;
