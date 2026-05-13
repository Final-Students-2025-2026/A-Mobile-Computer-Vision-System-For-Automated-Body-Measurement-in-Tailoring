import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ThemeName = "dark" | "light";

const storageKey = "measure-ai-theme";

const palette = {
  dark: {
    name: "dark" as const,
    background: "#1a1a1a",
    authBackground: "#000000",
    surface: "#252525",
    surfaceAlt: "#3a3a3a",
    text: "#ffffff",
    muted: "#888888",
    subtle: "#aaaaaa",
    border: "#333333",
    primary: "#b8f54a",
    primaryText: "#1a1a1a",
    overlay: "rgba(0,0,0,0.7)",
    input: "#2a2a2a",
    danger: "#ff6b6b",
  },
  light: {
    name: "light" as const,
    background: "#f5f7f2",
    authBackground: "#f5f7f2",
    surface: "#ffffff",
    surfaceAlt: "#e7eadf",
    text: "#172012",
    muted: "#697264",
    subtle: "#4f5a49",
    border: "#d9dfd0",
    primary: "#9bd832",
    primaryText: "#172012",
    overlay: "rgba(23,32,18,0.35)",
    input: "#eef2e8",
    danger: "#c2413a",
  },
};

type ThemeContextValue = {
  themeName: ThemeName;
  theme: (typeof palette)[ThemeName];
  setThemeName: (theme: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeNameState] = useState<ThemeName>("dark");

  useEffect(() => {
    AsyncStorage.getItem(storageKey).then((storedTheme) => {
      if (storedTheme === "dark" || storedTheme === "light") {
        setThemeNameState(storedTheme);
      }
    });
  }, []);

  const setThemeName = (nextTheme: ThemeName) => {
    setThemeNameState(nextTheme);
    AsyncStorage.setItem(storageKey, nextTheme);
  };

  const value = useMemo(
    () => ({
      themeName,
      theme: palette[themeName],
      setThemeName,
    }),
    [themeName],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used within a ThemeProvider");
  }

  return context;
}
