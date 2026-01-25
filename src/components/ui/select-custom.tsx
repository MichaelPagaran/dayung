"use client";

import * as React from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
    label: string;
    value: string;
}

interface CustomSelectProps {
    value?: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    className?: string;
}

export function CustomSelect({
    value,
    onChange,
    options,
    placeholder = "Select...",
    className,
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Close on click outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchQuery(""); // Reset search on close
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find((opt) => opt.value === value);

    // Filter options
    const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const showSearch = options.length > 10;

    return (
        <div className={cn("relative w-full", className)} ref={containerRef}>
            <button
                type="button"
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
                    isOpen && "ring-2 ring-brand border-transparent"
                )}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={cn("block truncate", !selectedOption && "text-gray-500")}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg animate-in fade-in zoom-in-95 duration-100">
                    {showSearch && (
                        <div className="p-2 border-b border-gray-100 sticky top-0 bg-white rounded-t-md z-10">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    className="w-full rounded-md border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                    )}

                    <div className="max-h-[160px] overflow-y-auto py-1">
                        {filteredOptions.length === 0 ? (
                            <div className="px-2 py-2 text-xs text-gray-500 text-center">
                                No results found.
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={cn(
                                        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                                        option.value === value && "bg-primary-50 text-brand font-medium"
                                    )}
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                        setSearchQuery("");
                                    }}
                                >
                                    <span className="flex-1 truncate">{option.label}</span>
                                    {option.value === value && (
                                        <Check className="ml-auto h-4 w-4" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
