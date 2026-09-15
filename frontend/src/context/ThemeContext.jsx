import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("parkease_theme") || "dark";
  });

  const [resolvedTheme, setResolvedTheme] = useState("dark");

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    const applyTheme = () => {
      let active = theme;
      if (theme === "system") {
        active = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }

      setResolvedTheme(active);

      if (active === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
        root.setAttribute("data-theme", "dark");
        body.classList.add("bg-dark-bg", "text-white");
        body.classList.remove("bg-slate-50", "text-slate-900");
      } else {
        root.classList.add("light");
        root.classList.remove("dark");
        root.setAttribute("data-theme", "light");
        body.classList.add("bg-slate-50", "text-slate-900");
        body.classList.remove("bg-dark-bg", "text-white");
      }
    };

    applyTheme();
    localStorage.setItem("parkease_theme", theme);

    if (theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = () => applyTheme();
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, [theme]);

  const changeTheme = (newTheme) => {
    if (["dark", "light", "system"].includes(newTheme)) {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme: changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
