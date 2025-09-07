// components/Navbar.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  authState,
  openDashboardAtom,
  showNavAtom,
} from "../recoil/globalAtom";
import { useAuth } from "../hooks/useAuth";
import { LuLayoutDashboard } from "react-icons/lu";
import { IoLogoGithub } from "react-icons/io";
import { CiLinkedin } from "react-icons/ci";
import { IoMailOpenOutline } from "react-icons/io5";

function Navbar({ theme, setTheme }) {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(true);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", newTheme);
  };

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      setVisible(window.scrollY < lastScrollY);
      lastScrollY = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auth
  useAuth();
  const [state, setState] = useRecoilState(authState);

  const [openDashboard, setOpenDashboard] = useRecoilState(openDashboardAtom);
  const setShowNav = useSetRecoilState(showNavAtom);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setState({ user: null, loading: false });
  };

  return (
    <nav
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 w-[90%] md:w-[80%] z-50 transition-transform duration-500 ${
        visible ? "translate-y-0" : "-translate-y-[120%]"
      }`}
    >
      <div className="px-6 py-3 shadow-2xl rounded-2xl backdrop-blur-md border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-100 to-purple-200 dark:from-sky-950 dark:via-indigo-900 dark:to-purple-950 transition-colors duration-500">
        <div className="flex justify-between items-center h-16">
          {/* Logo + Dashboard */}
          <div className="flex items-center gap-2">
            {/* Dashboard Icon (only if logged in) */}
            {state.user && (
              <div
                onClick={() => {
                  setOpenDashboard(!openDashboard);
                  setShowNav(false);
                }}
                className="flex items-center cursor-pointer transition-all duration-300 ease-in-out"
              >
                <LuLayoutDashboard className="text-3xl text-indigo-700 hover:text-purple-700 dark:text-white dark:hover:text-indigo-300 transition-colors duration-300" />
              </div>
            )}

            {/* Logo */}
            <Link
              to="/"
              className="flex  select-none cursor-pointerjustify-center items-center sm:p-2 sm:m-2 sm:border-2 rounded-full"
            >
              <img
                className="w-8 rounded-full sm:w-10"
                src="./icon.jpeg"
                alt="logo"
              />
              <span className="hidden sm:block sm:text-xl text-heading text-md ml-2 dark:text-white">
                SR's🛡️Sʜɪᴇʟᴅ
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center">
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

            {/* Auth Buttons */}
            {state.user ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-900 dark:text-gray-100">
                  Welcome, {state.user.name}
                </span>
                {state.user.role === "admin" && (
                  <Link
                    to="/admin/dashboard"
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/signin"
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <div className="flex justify-center items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white/40 dark:bg-black/40 text-gray-900 dark:text-gray-100 hover:rotate-180 transition-transform duration-500"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {/* Social Link  */}
            <div className="flex items-center gap-2">
              <IoLogoGithub
                onClick={() => {
                  window.open("https://github.com/H4CK3R-CODING");
                }}
                className="w-7 h-7 cursor-pointer text-heading "
              />
              <CiLinkedin
                onClick={() => {
                  window.open(
                    "https://www.linkedin.com/in/gaurav-rathour-85b878264/"
                  );
                }}
                className="w-7 h-7 cursor-pointer text-heading "
              />
              <IoMailOpenOutline
                onClick={() => {
                  window.open("mailto:gauravrathouor0786@gmail.com");
                }}
                className="w-7 h-7 cursor-pointer text-heading "
              />
            </div>
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
        <div className="shadow-lg px-4 pt-4 pb-6 space-y-4 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-200 dark:from-sky-950 dark:via-indigo-900 dark:to-purple-950 transition-colors duration-500">
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

          {/* Auth Buttons Mobile */}
          {state.user ? (
            <div className="flex flex-col gap-2">
              <span className="text-gray-900 dark:text-gray-100">
                Welcome, {state.user.name}
              </span>
              {state.user.role === "admin" && (
                <Link
                  to="/admin/dashboard"
                  className="bg-red-500 text-white px-3 py-1 rounded text-center"
                  onClick={toggleMenu}
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  toggleMenu();
                }}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                to="/signin"
                onClick={toggleMenu}
                className="bg-green-500 text-white px-3 py-1 rounded text-center"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                onClick={toggleMenu}
                className="bg-blue-500 text-white px-3 py-1 rounded text-center"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Theme Toggle */}
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
