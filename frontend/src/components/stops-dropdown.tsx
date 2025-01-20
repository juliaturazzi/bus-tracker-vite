import {useState, useEffect, forwardRef, useRef} from "react";
import stopsData from "@/stops.json";
import {FixedSizeList as List} from "react-window";
import {cn} from "@/lib/utils";
import {Input} from "@/components/ui/input";


interface StopsDropdownProps {
  onChange: (value: string | null) => void;
  value: string | null;
}

const height = 40;

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
    closeDropdown();
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
            className={cn(
              "px-4 py-2 cursor-pointer transition-colors",
              value === option.value
                ? "bg-gray-200 text-black dark:bg-gray-700 dark:text-white"
                : "bg-white text-black dark:bg-black dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
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
    const [search, setSearch] = useState<string>("");
    const [filteredStops, setFilteredStops] = useState<
      {value: string; label: string}[]
    >([]);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      const formattedStops = stopsData.map((stop) => ({
        value: stop.id,
        label: stop.stop_name,
      }));
      setStops(formattedStops);
      setFilteredStops(formattedStops);
    }, []);

    useEffect(() => {
      setFilteredStops(
        stops.filter((stop) =>
          stop.label.toLowerCase().includes(search.toLowerCase())
        )
      );
    }, [search, stops]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);

    const handleToggle = () => {
      setIsOpen((prev) => !prev);
      if (!isOpen) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 0);
      } else {
        setSearch("");
      }
    };

    const handleSelect = (selectedValue: string) => {
      onChange(selectedValue);
      setIsOpen(false);
      setSearch("");
    };

    return (
      <div ref={ref} className="w-full relative">
        <div
          className={cn(
            "w-full px-4 py-2 rounded flex items-center justify-between cursor-pointer transition-colors",
            "bg-white text-black dark:bg-gray-950 dark:text-white border-solid border-inherit border"
          )}
          onClick={handleToggle}
        >
          {isOpen ? (
            <div className="flex w-full items-center gap-2">
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Pesquisar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          ) : (
            <span>
              {value
                ? stops.find((stop) => stop.value === value)?.label
                : "Select a stop"}
            </span>
          )}
        </div>

        {isOpen && (
          <div
            className={cn(
              "absolute z-10 mt-1 w-full rounded shadow-md bg-white dark:bg-black"
            )}
          >
            <VirtualizedDropdown
              options={filteredStops}
              value={value}
              onChange={handleSelect}
              closeDropdown={() => setIsOpen(false)}
              maxHeight={300}
            />
          </div>
        )}
      </div>
    );
  }
);

StopsDropdown.displayName = "StopsDropdown";

export default StopsDropdown;
