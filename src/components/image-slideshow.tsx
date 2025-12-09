"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageSlideshowProps {
    images: string[];
    alt: string;
}

export function ImageSlideshow({ images, alt }: ImageSlideshowProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
        return null;
    }

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    return (
        <div className="glass-card rounded-3xl overflow-hidden shadow-soft border-0">
            {/* Main Image */}
            <div className="aspect-video relative bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <Image
                    src={images[currentIndex]}
                    alt={`${alt} - Image ${currentIndex + 1}`}
                    fill
                    className="object-cover"
                    priority={currentIndex === 0}
                />

                {/* Navigation Arrows - Only show if more than 1 image */}
                {images.length > 1 && (
                    <>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={goToPrevious}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={goToNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </Button>
                    </>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                    <div className="absolute top-4 right-4 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
                        {currentIndex + 1} / {images.length}
                    </div>
                )}
            </div>

            {/* Thumbnail Navigation - Only show if more than 1 image */}
            {images.length > 1 && (
                <div className="p-4 bg-white/5 border-t border-white/10">
                    <div className="flex gap-2 overflow-x-auto">
                        {images.map((image: string, index: number) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`relative shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${index === currentIndex
                                        ? 'border-black dark:border-white scale-105'
                                        : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                            >
                                <Image
                                    src={image}
                                    alt={`${alt} thumbnail ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
