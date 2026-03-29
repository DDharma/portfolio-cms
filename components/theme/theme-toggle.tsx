"use client";

import { Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme/theme-provider";

export const ThemeToggle = ({
  className,
}: {
  className?: string;
}) => {
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <button
      type="button"
      className={cn(
        "relative flex h-11 w-20 items-center rounded-full border border-white/10 bg-white/10 px-2 text-white transition hover:border-white/30",
        className
      )}
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <span
        className={cn(
          "absolute inset-y-1 w-8 rounded-full bg-white/80 transition-all",
          theme === "dark" ? "left-1" : "left-10",
          !mounted && "opacity-0"
        )}
      />
      <Sun
        className={cn("h-4 w-4 transition", theme === "light" ? "text-zinc-900" : "text-white/40")}
      />
      <Moon
        className={cn(
          "ml-auto h-4 w-4 transition",
          theme === "dark" ? "text-zinc-900" : "text-white/40"
        )}
      />
    </button>
  );
};
