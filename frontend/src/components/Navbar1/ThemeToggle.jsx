import { Sun, Moon } from "lucide-react";

function ThemeToggle({ theme, toggleTheme }) {
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-white/40 dark:bg-black/40 text-gray-900 dark:text-gray-100 hover:rotate-180 transition-transform duration-500"
    >
      {theme === "dark" ? <Sun size={22} /> : <Moon size={22} />}
    </button>
  );
}

export default ThemeToggle;
