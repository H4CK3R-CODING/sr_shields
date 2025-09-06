import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Sun, Moon } from "lucide-react";

function Navbar({ theme, setTheme }) {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(true);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScrollY = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 w-[90%] md:w-[80%] z-50 transition-transform duration-500 ${
        visible ? "translate-y-0" : "-translate-y-[120%]"
      }`}
    >
      <div
        className={`px-6 py-3 shadow-2xl transition-colors duration-500 rounded-2xl backdrop-blur-md border
        ${
          theme === "dark"
            ? "bg-gradient-to-br from-sky-950 via-indigo-900 to-purple-950 border-indigo-800"
            : "bg-gradient-to-br from-indigo-100 to-purple-200 border-indigo-200"
        }`}
      >
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-extrabold tracking-wide text-blue-700 dark:text-blue-300 hover:scale-105 transition-transform"
          >
            SR Shield
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-10 items-center">
            {["Home", "About", "Contact"].map((item) => (
              <Link
                key={item}
                to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                className="relative text-gray-900 dark:text-gray-100 font-medium group transition"
              >
                {item}
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-500 dark:bg-blue-300 transition-all group-hover:w-full"></span>
              </Link>
            ))}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white/40 dark:bg-black/40 text-gray-900 dark:text-gray-100 hover:rotate-180 transition-transform duration-500"
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
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-96 mt-2" : "max-h-0"
        }`}
      >
        <div
          className={`shadow-lg px-4 pt-4 pb-6 space-y-4 rounded-xl
          ${
            theme === "dark"
              ? "bg-gradient-to-br from-sky-950 via-indigo-900 to-purple-950"
              : "bg-gradient-to-br from-indigo-100 to-purple-200"
          }`}
        >
          {["Home", "About", "Contact"].map((item) => (
            <Link
              key={item}
              to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
              onClick={toggleMenu}
              className="block text-lg text-gray-900 dark:text-gray-100 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition"
            >
              {item}
            </Link>
          ))}

          <button
            onClick={toggleTheme}
            className="w-full mt-2 p-2 rounded-lg bg-white/40 dark:bg-black/40 text-gray-900 dark:text-gray-100 hover:scale-105 transition flex items-center justify-center"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            <span className="ml-2">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
