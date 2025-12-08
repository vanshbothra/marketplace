"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, ShoppingBag, GraduationCap, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface MarketplaceFiltersProps {
    currentParams: {
        search?: string;
        type?: string;
        sort?: string;
        tags?: string;
        page?: string;
    };
    allTags: string[];
}

export function MarketplaceFilters({ currentParams, allTags }: MarketplaceFiltersProps) {
    const router = useRouter();
    const [searchValue, setSearchValue] = useState(currentParams.search || '');
    const selectedTags = currentParams.tags ? currentParams.tags.split(',') : [];

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchValue !== currentParams.search) {
                const params = new URLSearchParams(currentParams as any);
                if (searchValue) {
                    params.set('search', searchValue);
                } else {
                    params.delete('search');
                }
                params.delete('page'); // Reset to page 1 on search
                router.push(`/marketplace?${params.toString()}`);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchValue]);

    const handleTypeChange = (value: string) => {
        const params = new URLSearchParams(currentParams as any);
        if (value && value !== 'all') {
            params.set('type', value);
        } else {
            params.delete('type');
        }
        params.delete('page');
        router.push(`/marketplace?${params.toString()}`);
    };

    const handleSortChange = (value: string) => {
        const params = new URLSearchParams(currentParams as any);
        if (value && value !== 'default') {
            params.set('sort', value);
        } else {
            params.delete('sort');
        }
        params.delete('page');
        router.push(`/marketplace?${params.toString()}`);
    };

    const toggleTag = (tag: string) => {
        const params = new URLSearchParams(currentParams as any);
        let tags = selectedTags;

        if (tags.includes(tag)) {
            tags = tags.filter(t => t !== tag);
        } else {
            tags = [...tags, tag];
        }

        if (tags.length > 0) {
            params.set('tags', tags.join(','));
        } else {
            params.delete('tags');
        }
        params.delete('page');
        router.push(`/marketplace?${params.toString()}`);
    };

    return (
        <div className="space-y-6 mb-8">
            {/* Search and Filters Row */}
            <div className="glass-card rounded-3xl p-6 shadow-soft border-0">
                <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
                    {/* Search */}
                    <div className="md:col-span-6 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search listings..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="pl-10 rounded-2xl"
                        />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 md:col-span-2">
                        {/* Type Filter */}
                        <Select
                            value={currentParams.type || 'all'}
                            onValueChange={handleTypeChange}
                        >
                            <SelectTrigger className="rounded-2xl">
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="PRODUCT">
                                    <div className="flex items-center gap-2">
                                        <ShoppingBag className="h-4 w-4" />
                                        Products
                                    </div>
                                </SelectItem>
                                <SelectItem value="SERVICE">
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4" />
                                        Services
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Sort */}
                        <Select
                            value={currentParams.sort || 'default'}
                            onValueChange={handleSortChange}
                        >
                            <SelectTrigger className="rounded-2xl">
                                <SelectValue placeholder="Sort By" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="default">Latest</SelectItem>
                                <SelectItem value="price:asc">Price: Low to High</SelectItem>
                                <SelectItem value="price:desc">Price: High to Low</SelectItem>
                                <SelectItem value="name:asc">Name: A to Z</SelectItem>
                                <SelectItem value="name:desc">Name: Z to A</SelectItem>
                                <SelectItem value="createdAt:desc">Newest First</SelectItem>
                                <SelectItem value="createdAt:asc">Oldest First</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Tags */}
                {allTags.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-sm text-muted-foreground mb-3">Filter by tags:</p>
                        <div className="flex flex-wrap gap-2">
                            {allTags.map((tag) => {
                                const isSelected = selectedTags.includes(tag);
                                return (
                                    <Badge
                                        key={tag}
                                        variant={isSelected ? "default" : "outline"}
                                        className="rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => toggleTag(tag)}
                                    >
                                        {tag}
                                        {isSelected && <X className="ml-1 h-3 w-3" />}
                                    </Badge>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Category Quick Filters */}
            {/* <div className="flex gap-3 flex-wrap">
                <Button
                    asChild
                    variant={!currentParams.type ? "default" : "ghost"}
                    size="lg"
                    className={`rounded-2xl ${!currentParams.type ? "" : "glass-light"}`}
                >
                    <Link href="/marketplace">All</Link>
                </Button>
                <Button
                    asChild
                    variant={currentParams.type === "PRODUCT" ? "default" : "ghost"}
                    size="lg"
                    className={`rounded-2xl ${currentParams.type === "PRODUCT" ? "" : "glass-light"}`}
                >
                    <Link href="/marketplace?type=PRODUCT">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Products
                    </Link>
                </Button>
                <Button
                    asChild
                    variant={currentParams.type === "SERVICE" ? "default" : "ghost"}
                    size="lg"
                    className={`rounded-2xl ${currentParams.type === "SERVICE" ? "" : "glass-light"}`}
                >
                    <Link href="/marketplace?type=SERVICE">
                        <GraduationCap className="mr-2 h-4 w-4" />
                        Services
                    </Link>
                </Button>
            </div> */}
        </div>
    );
}
