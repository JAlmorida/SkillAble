import { useGetSettingsQuery, useUpdateSettingsMutation } from "@/features/api/userApi";
import { createContext, useContext, useEffect, useState } from "react"

const ThemeProviderContext = createContext({
  theme: "system",
  setTheme: () => null,
})

export function ThemeProvider({
  children,
  user,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}) {
  const userKey = `${user?.id || "guest"}_${storageKey}`;
  const [theme, setTheme] = useState(
    () => localStorage.getItem(userKey) || defaultTheme
  );

  const { data: settings, isSuccess } = useGetSettingsQuery(undefined, { skip: !user });
  const [updateSettings] = useUpdateSettingsMutation();

  useEffect(() => {
    if (isSuccess && settings) {
      setTheme(settings.theme ?? defaultTheme);
    }
  }, [isSuccess, settings, defaultTheme]);

  useEffect(() => {
    if (!user || !isSuccess) return;
    updateSettings({ theme });
  }, [theme, user, isSuccess, updateSettings]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
      return;
    }
    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme) => {
      localStorage.setItem(userKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
