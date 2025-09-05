import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Sun, Moon } from "lucide-react";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  const toggleMenu = () => setIsOpen(!isOpen);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(!isDark);
    localStorage.setItem("theme", isDark ? "light" : "dark");
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md fixed w-full top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="text-2xl font-bold text-blue-600 dark:text-blue-400"
            >
              SR Shield
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link
              to="/"
              className="text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              About
            </Link>
            <Link
              to="/courses"
              className="text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              Courses
            </Link>
            <Link
              to="/contact"
              className="text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              Contact
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg">
          <div className="space-y-2 px-4 pt-2 pb-3">
            <Link
              to="/"
              onClick={toggleMenu}
              className="block text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              Home
            </Link>
            <Link
              to="/about"
              onClick={toggleMenu}
              className="block text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              About
            </Link>
            <Link
              to="/courses"
              onClick={toggleMenu}
              className="block text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              Courses
            </Link>
            <Link
              to="/contact"
              onClick={toggleMenu}
              className="block text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              Contact
            </Link>

            <button
              onClick={toggleTheme}
              className="w-full mt-2 p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center justify-center"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
              <span className="ml-2">{isDark ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
