import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useRecoilState } from "recoil";
import { authState } from "../../recoil/globalAtom";
import { useAuth } from "../../hooks/useAuth";

import Logo from "./Logo";
import NavLinks from "./NavLinks";
import AuthButtons from "./AuthButtons";
import SocialLinks from "./SocialLinks";
import ThemeToggle from "./ThemeToggle";
import MobileMenu from "./MobileMenu";

function Navbar({ theme, setTheme }) {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [state, setState] = useRecoilState(authState);

  useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      setVisible(window.scrollY < lastScrollY);
      lastScrollY = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setState({ user: null, loading: false });
  };

  return (
    <nav
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 w-[95%] lg:w-[80%] z-40 transition-transform duration-500 ${
        visible ? "translate-y-0" : "-translate-y-[120%]"
      }`}
    >
      <div className="px-6 py-3 shadow-2xl rounded-2xl backdrop-blur-md border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-100 to-purple-200 dark:from-sky-950 dark:via-indigo-900 dark:to-purple-950">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Logo */}
          <Logo />

          {/* Center - Nav Links (only on lg and up) */}
          <div className="hidden xl:flex items-center gap-6 flex-wrap">
  <NavLinks />
  <AuthButtons state={state} handleLogout={handleLogout} />
</div>

          {/* Right Side - Theme + Socials + Hamburger */}
          <div className="flex items-center gap-3">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <div className="hidden lg:flex">
              <SocialLinks />
            </div>

            {/* Show hamburger menu between lg and xl */}
<div className="flex xl:hidden">
  <button
    onClick={toggleMenu}
    className="p-2 rounded-md text-gray-900 dark:text-gray-100 hover:bg-white/40 dark:hover:bg-black/40 transition"
  >
    {isOpen ? <X size={26} /> : <Menu size={26} />}
  </button>
</div>
          </div>
        </div>
      </div>

      {/* Mobile Menu (for < lg) */}
      <MobileMenu
        isOpen={isOpen}
        state={state}
        handleLogout={handleLogout}
        toggleMenu={toggleMenu}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    </nav>
  );
}

export default Navbar;
