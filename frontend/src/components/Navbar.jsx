import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Sun, Moon } from "lucide-react";

function Navbar({ theme, setTheme }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Hide on scroll down, show on scroll up
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setVisible(false); // scrolling down → hide
      } else {
        setVisible(true); // scrolling up → show
      }
      lastScrollY = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed w-full top-0 left-0 z-50 transition-transform duration-500 ${
        visible ? "translate-y-0" : "-translate-y-full"
      } shadow-lg`}
    >
      <div
        className={`px-6 py-2 shadow-xl transition-colors duration-500 rounded-2xl
        ${
          theme === "dark"
            ? "bg-gradient-to-br from-sky-950 via-indigo-900 to-purple-950"
            : "bg-gradient-to-br from-indigo-200 to-purple-200"
        } rounded-b-2xl`}
      >
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold text-blue-700 dark:text-blue-300"
          >
            SR Shield
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link
              to="/"
              className="text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition"
            >
              Contact
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white/40 dark:bg-black/40 text-gray-900 dark:text-gray-100 hover:bg-white/60 dark:hover:bg-black/60 transition"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-900 dark:text-gray-100 hover:bg-white/40 dark:hover:bg-black/40 transition"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div
          className={`md:hidden shadow-lg px-4 pt-2 pb-3 space-y-2 transition-colors duration-500
          ${
            theme === "dark"
              ? "bg-gradient-to-br from-sky-950 via-indigo-900 to-purple-950"
              : "bg-gradient-to-br from-indigo-200 to-purple-200"
          }`}
        >
          <Link
            to="/"
            onClick={toggleMenu}
            className="block text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition"
          >
            Home
          </Link>
          <Link
            to="/about"
            onClick={toggleMenu}
            className="block text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition"
          >
            About
          </Link>
          <Link
            to="/contact"
            onClick={toggleMenu}
            className="block text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition"
          >
            Contact
          </Link>

          <button
            onClick={toggleTheme}
            className="w-full mt-2 p-2 rounded-lg bg-white/40 dark:bg-black/40 text-gray-900 dark:text-gray-100 hover:bg-white/60 dark:hover:bg-black/60 transition flex items-center justify-center"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            <span className="ml-2">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
