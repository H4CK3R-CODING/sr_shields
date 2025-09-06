import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Footer from "./components/Footer";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import AnnouncementDetail from "./pages/AnnouncementDetail";

// ScrollToTop component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [pathname]);
  return null;
};

function App() {
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) return storedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // Apply theme changes
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <Router>
      {/* Scroll to top on route change */}
      <ScrollToTop />

      {/* Navbar */}
      <Navbar theme={theme} setTheme={setTheme} />

      {/* Page Content */}
      <div
        className={`min-h-screen transition-colors duration-700 ease-in-out ${
          theme === "dark"
            ? "bg-gradient-to-tr from-sky-900 via-indigo-950 to-purple-900 text-white"
            : "bg-gradient-to-tr from-sky-300 via-indigo-200 to-purple-200 text-gray-900"
        }`}
      >
        <main className="max-w-6xl mx-auto px-4 pt-24 pb-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route
              path="/announcements/:slug"
              element={<AnnouncementDetail />}
            />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
