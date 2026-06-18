import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Palette, Moon, Sun, Check } from "lucide-react";
import { COLOR_THEMES, useTheme } from "./ThemeProvider";

export function ThemePicker() {
  const { color, mode, setColor, toggleMode } = useTheme();
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMode}
        aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        title={mode === "dark" ? "Light mode" : "Dark mode"}
      >
        {mode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Choose color theme" title="Color theme">
            <Palette className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64">
          <div className="text-xs font-medium text-muted-foreground mb-2">Color theme</div>
          <div className="grid grid-cols-5 gap-2">
            {COLOR_THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setColor(t.id)}
                title={t.label}
                aria-label={t.label}
                className="relative grid place-items-center h-10 w-10 rounded-lg border border-border transition-transform hover:scale-105"
                style={{ background: t.swatch }}
              >
                {color === t.id && <Check className="h-4 w-4 text-white drop-shadow" />}
              </button>
            ))}
          </div>
          <div className="mt-3 text-[11px] text-muted-foreground">
            Your choice is saved on this device.
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
