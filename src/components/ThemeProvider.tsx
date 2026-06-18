import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ColorTheme =
  | "indigo"
  | "violet"
  | "emerald"
  | "rose"
  | "amber"
  | "sky"
  | "teal"
  | "slate"
  | "crimson"
  | "sunset";

export type Mode = "light" | "dark";

export const COLOR_THEMES: { id: ColorTheme; label: string; swatch: string }[] = [
  { id: "indigo", label: "Indigo", swatch: "oklch(0.52 0.19 265)" },
  { id: "violet", label: "Violet", swatch: "oklch(0.55 0.22 295)" },
  { id: "emerald", label: "Emerald", swatch: "oklch(0.6 0.16 160)" },
  { id: "teal", label: "Teal", swatch: "oklch(0.6 0.13 195)" },
  { id: "sky", label: "Sky", swatch: "oklch(0.62 0.16 230)" },
  { id: "rose", label: "Rose", swatch: "oklch(0.6 0.21 15)" },
  { id: "crimson", label: "Crimson", swatch: "oklch(0.55 0.22 25)" },
  { id: "amber", label: "Amber", swatch: "oklch(0.72 0.17 70)" },
  { id: "sunset", label: "Sunset", swatch: "oklch(0.65 0.2 40)" },
  { id: "slate", label: "Slate", swatch: "oklch(0.5 0.04 260)" },
];

type ThemeCtx = {
  color: ColorTheme;
  mode: Mode;
  setColor: (c: ColorTheme) => void;
  setMode: (m: Mode) => void;
  toggleMode: () => void;
};

const Ctx = createContext<ThemeCtx | null>(null);

const COLOR_KEY = "handy.color";
const MODE_KEY = "handy.mode";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [color, setColorState] = useState<ColorTheme>("indigo");
  const [mode, setModeState] = useState<Mode>("light");

  // Load from localStorage on mount (client only)
  useEffect(() => {
    try {
      const c = localStorage.getItem(COLOR_KEY) as ColorTheme | null;
      const m = localStorage.getItem(MODE_KEY) as Mode | null;
      if (c) setColorState(c);
      if (m) setModeState(m);
      else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) setModeState("dark");
    } catch {}
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", color);
    try {
      localStorage.setItem(COLOR_KEY, color);
    } catch {}
  }, [color]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", mode === "dark");
    try {
      localStorage.setItem(MODE_KEY, mode);
    } catch {}
  }, [mode]);

  return (
    <Ctx.Provider
      value={{
        color,
        mode,
        setColor: setColorState,
        setMode: setModeState,
        toggleMode: () => setModeState((m) => (m === "dark" ? "light" : "dark")),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
