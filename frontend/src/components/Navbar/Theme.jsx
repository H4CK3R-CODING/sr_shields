import { MdDarkMode, MdLightMode } from "react-icons/md";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoCloseSharp } from "react-icons/io5";
import { authState, openDashboardAtom, showNavAtom } from "../../recoil/globalAtom";
import { useRecoilState, useSetRecoilState } from "recoil";
import SocailLink from "./SocailLink";
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Menu, X, Sun, Moon } from "lucide-react";

const Theme = () => {
  const [theme, setTheme] = useState("light");
  const [navShow, setNavShow] = useRecoilState(showNavAtom);
  const setOpenDashboard = useSetRecoilState(openDashboardAtom);

  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(true);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

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
  useAuth(); // runs background verification
  const [state, setState] = useRecoilState(authState);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setState({ user: null, loading: false });
  };

  // const toggleTheme = () => {
  //   if (theme === "light") {
  //     document.body.classList.add("dark");
  //     document.body.classList.remove("light");
  //     localStorage.setItem("theme", "dark");
  //     setTheme("dark");
  //   } else {
  //     document.body.classList.add("light");
  //     document.body.classList.remove("dark");
  //     localStorage.setItem("theme", "light");
  //     setTheme("light");
  //   }
  // };

  const toggleNav = () => {
    setNavShow(!navShow);
    setOpenDashboard(false);
  };

  return (
    <div className="flex justify-center items-center p-2 m-2 gap-3">
      {/* Social Links (hidden on small screens) */}
      <div className="px-4 hidden sm:block">
        <SocailLink />
      </div>

      {/* Theme Toggle */}
      {/* <div onClick={toggleTheme} className="cursor-pointer">
        {theme === "dark" ? (
          <MdLightMode className="w-7 h-7 text-heading" />
        ) : (
          <MdDarkMode className="w-7 h-7 text-heading" />
        )}
      </div> */}

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg bg-white/40 dark:bg-black/40 text-gray-900 dark:text-gray-100 hover:rotate-180 transition-transform duration-500"
      >
        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Mobile Nav Toggle */}
      <button
        onClick={toggleNav}
        className="navIcon transition-transform duration-500 ease-in-out block cursor-pointer lg:hidden z-50 p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        <div className="relative top-0 left-0 w-7 h-7 focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <GiHamburgerMenu
            className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
              navShow
                ? "rotate-90 scale-0 opacity-0"
                : "rotate-0 scale-100 opacity-100"
            } text-heading w-7 h-7`}
          />
          <IoCloseSharp
            className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
              navShow
                ? "rotate-0 scale-100 opacity-100"
                : "-rotate-90 scale-0 opacity-0"
            } text-heading w-7 h-7`}
          />
        </div>
      </button>
    </div>
  );
};

export default Theme;
