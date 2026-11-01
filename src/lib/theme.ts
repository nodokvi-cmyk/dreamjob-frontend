export type Theme = "light" | "dark";

export const THEME_KEY = "theme";

export const THEME_SCRIPT = `(function(){try{var s=localStorage.getItem("${THEME_KEY}");var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {}
}

export function currentTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}
