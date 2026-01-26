"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Placeholder images - will be replaced with actual images
const slides = [
    {
        id: 1,
        gradient: "from-primary-400 to-primary-600",
        title: "Manage Your Properties",
        description: "Keep track of all your units in one place",
    },
    {
        id: 2,
        gradient: "from-primary-500 to-primary-700",
        title: "Track Payments",
        description: "Monitor billing and payment status effortlessly",
    },
    {
        id: 3,
        gradient: "from-primary-400 to-teal-500",
        title: "Community Management",
        description: "Connect with residents and manage facilities",
    },
];

export function ImageCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-advance slides every 5 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600">
            {/* Slides */}
            <div
                className="flex h-full transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
                {slides.map((slide) => (
                    <div
                        key={slide.id}
                        className={cn(
                            "min-w-full h-full flex flex-col items-center justify-center p-8 text-white bg-gradient-to-br",
                            slide.gradient
                        )}
                    >
                        {/* Placeholder content - replace with images */}
                        <div className="flex flex-col items-center justify-center flex-1">
                            <div className="w-64 h-64 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-8">
                                <span className="text-6xl">☁️</span>
                            </div>
                            <h3 className="text-2xl font-heading font-semibold text-center mb-2">
                                {slide.title}
                            </h3>
                            <p className="text-white/80 text-center font-body">
                                {slide.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Dot Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={cn(
                            "w-2.5 h-2.5 rounded-full transition-all duration-300",
                            currentSlide === index
                                ? "bg-white scale-110"
                                : "bg-white/50 hover:bg-white/70"
                        )}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
