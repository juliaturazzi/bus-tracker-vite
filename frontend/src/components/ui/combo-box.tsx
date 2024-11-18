"use client";

import * as React from "react";
import { Check, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Option {
    value: string;
    label: string;
}

interface ComboboxProps {
    options: Option[];
    placeholder: string;
}

const PAGE_SIZE = 800;

export function Combobox({ options, placeholder }: ComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState("");
    const [currentPage, setCurrentPage] = React.useState(0);

    const handleSelect = (currentValue: string) => {
        setValue(currentValue === value ? "" : currentValue);
        setOpen(false);
    };

    const paginatedOptions = options.slice(
        currentPage * PAGE_SIZE,
        (currentPage + 1) * PAGE_SIZE
    );

    const totalPages = Math.ceil(options.length / PAGE_SIZE);

    const handlePreviousPage = () => {
        if (currentPage > 0) setCurrentPage((prevPage) => prevPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage + 1 < totalPages) setCurrentPage((prevPage) => prevPage + 1);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-controls="dropdown-list"
                    className="w-full justify-between"
                >
                    {value
                        ? options.find((option) => option.value === value)?.label
                        : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="p-0 w-full left-0 min-w-[var(--radix-popover-trigger-width)]"
            >
                <Command>
                    <CommandInput />
                    <div className="flex justify-between px-4 py-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={currentPage === 0}
                            onClick={handlePreviousPage}
                            className="flex items-center gap-1"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Anterior
                        </Button>
                        <span className="text-sm">
                            Página {currentPage + 1} de {totalPages}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={currentPage + 1 === totalPages}
                            onClick={handleNextPage}
                            className="flex items-center gap-1"
                        >
                            Próxima
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <CommandList id="dropdown-list">
                        {paginatedOptions.length > 0 ? (
                            paginatedOptions.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={() => handleSelect(option.value)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))
                        ) : (
                            <CommandEmpty>Nenhum resultado encontrado</CommandEmpty>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
