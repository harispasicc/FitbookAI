"use client";
import { useLayoutEffect, useState } from "react";
export function useIsBreakpointLg() {
    const [matches, setMatches] = useState(false);
    useLayoutEffect(() => {
        const mq = window.matchMedia("(min-width: 1024px)");
        setMatches(mq.matches);
        const onChange = () => setMatches(mq.matches);
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);
    return matches;
}
