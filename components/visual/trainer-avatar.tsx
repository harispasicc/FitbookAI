"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { faceUrlForSeed } from "@/lib/media-urls";
import { cn } from "@/lib/utils";
function initials(name: string) {
    return name
        .split(/\s+/)
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}
export function TrainerAvatar({ seed, className, size = "md", }: {
    seed: string;
    className?: string;
    size?: "sm" | "md" | "lg";
}) {
    const url = faceUrlForSeed(seed);
    const sz = size === "sm" ? "size-8" : size === "lg" ? "size-12" : "size-9";
    return (<Avatar className={cn(sz, "ring-2 ring-background shadow-sm", className)}>
      <AvatarImage src={url} alt=""/>
      <AvatarFallback className="text-[10px]">{initials(seed)}</AvatarFallback>
    </Avatar>);
}
