import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Footer from "./components/Footer";

function App() {
  const [theme, setTheme] = useState(() => {
    // Load theme from localStorage or respect system preference
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
      {/* Navbar */}
        <Navbar theme={theme} setTheme={setTheme} />
      <div
        className={`min-h-screen transition-colors duration-700 ease-in-out 
        ${
          theme === "dark"
            ? "bg-gradient-to-tr from-sky-900 via-indigo-950 to-purple-900 text-white"
            : "bg-gradient-to-tr from-sky-200 via-indigo-100 to-purple-100 text-black"
        }`}
      >
        

        {/* Page Content */}
        <main className="max-w-6xl mx-auto px-4 pt-24 pb-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer/>
      </div>
    </Router>
  );
}

export default App;
