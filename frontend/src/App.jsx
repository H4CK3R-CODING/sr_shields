import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Footer from "./components/Footer";
import AnnouncementDetail from "./pages/AnnouncementDetail";
import { Toaster } from "react-hot-toast";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Page404 from "./pages/404";
import AnnouncementsPage from "./pages/Announcement Page/AnnouncementsPage";
import Navbar from "./components/Navbar/Navbar";
import Developer from "./pages/Developer";
import ForgetPass from "./components/ForgetPass/ForgetPass";
import SetPassword from "./components/ForgetPass/SetPassword";
import JoinGroupsPage from "./pages/JoinGroupsPage";
import axios from "axios";
import FlashScreen from "./pages/FlashScreen";
import Model from "./components/Model";
import { useRecoilState, useRecoilValue } from "recoil";
import { authState } from "./recoil/globalAtom";
import Receipt from "./pages/Receipt";
import Cashbook from "./pages/Cashbook";
import SalesReport from "./pages/SalesReport";
import SendNotification from "./pages/SendNotification";

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

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // start with loading
  const [state, setState] = useRecoilState(authState);
  const [showModal, setShowModal] = useState(true);
  const closeModel = () => {
    setShowModal(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    // if no token, stop loading and keep user null
    if (!token) {
      setLoading(false);
      return;
    }

    // call backend to check if token is valid
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKENDURL}/api/v1/auth/me`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setUser(res.data); // ✅ logged in
        setState({ user: res.data, loading: false });
      } catch (err) {
        console.error("Auth check failed:", err);
        localStorage.removeItem("token");
        setUser(null); // ❌ not logged in
      } finally {
        setLoading(false); // stop loading either way
      }
    };

    fetchUser();
  }, []);

  // show loader while checking auth
  if (loading) {
    return <FlashScreen />;
  }

  return (
    <>
      {!user && <Model show={showModal} closeFun={closeModel} />}
      {/* Scroll to top on route change */}
      <ScrollToTop />

      {/* Navbar */}
      {/* <Navbar theme={theme} setTheme={setTheme} /> */}
      {/* <Navbar1/> */}
      <Navbar theme={theme} setTheme={setTheme} />

      {/* Your app routes/components */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Page Content */}
      <div
        className={`min-h-screen transition-colors duration-700 ease-in-out ${
          theme === "dark"
            ? "bg-gradient-to-tr from-sky-900 via-indigo-950 to-purple-900 text-white"
            : "bg-gradient-to-tr from-sky-300 via-indigo-200 to-purple-200 text-gray-900"
        }`}
      >
        <main className="max-w-6xl mx-auto px-4 pt-24 pb-10 select-none">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/about" element={<About />} />
            <Route path="/join" element={<JoinGroupsPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/receipt" element={<Receipt />} />

            <Route path="/announcement/:id" element={<AnnouncementDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cashbook" element={<Cashbook />} />

            <Route path="/sales-report" element={<SalesReport />} />
            <Route path="/send-notification" element={<SendNotification />} />

            <Route path="/forgetpass" element={<ForgetPass />} />
            <Route path="/setPassword" element={<SetPassword />} />
            <Route path="/developer" element={<Developer />} />
            <Route path="*" element={<Page404 />}></Route>
          </Routes>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}

export default App;
