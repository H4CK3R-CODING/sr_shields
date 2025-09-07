import { NavLink } from "react-router-dom";
import { useRecoilState } from "recoil";
import { RiHome2Line } from "react-icons/ri";
import { TiContacts } from "react-icons/ti";
import { AiOutlineLogout } from "react-icons/ai";
import { LiaSignInAltSolid } from "react-icons/lia";
import { FaFileSignature } from "react-icons/fa6";
import { showNavAtom, authState } from "../../recoil/globalAtom";
import axios from "axios";
import toast from "react-hot-toast";

const NavList = () => {
  const [showNav, setShowNav] = useRecoilState(showNavAtom);
  const [auth, setAuth] = useRecoilState(authState);
  const { user, loading } = auth;

  const handleLogout = async () => {
    setShowNav(false);
    toast.success("Logout Successfully!");
    localStorage.removeItem("token");
    setAuth({ user: null, loading: false });

    try {
      await axios.get(`${import.meta.env.VITE_BACKENDURL}/api/v1/user/logout`, {
        withCredentials: true,
      });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <ul
      className={`absolute top-full left-0 w-full bg-gradient-to-br from-indigo-200 to-purple-200 
      dark:from-sky-950 dark:via-indigo-900 dark:to-purple-950 
      lg:static lg:flex lg:w-auto lg:bg-transparent lg:rounded-full
      flex-col lg:flex-row p-4 gap-2 rounded-b-2xl shadow-lg transition-all duration-500 ease-in-out
      transform origin-top ${
        showNav ? "opacity-100 scale-y-100 translate-y-0" : "opacity-0 scale-y-95 -translate-y-2"
      } z-50`}
    >
      {/* Home */}
      <NavLink
        onClick={() => setShowNav(false)}
        className={({ isActive }) => (isActive ? "text-blue-500" : "text-heading")}
        to="/"
      >
        <li className="hover-underline-animation p-2 font-semibold rounded-xl cursor-pointer flex items-center gap-2">
          <RiHome2Line className="w-5 h-5" />
          Home
        </li>
      </NavLink>

      {/* Sign In / Register */}
      {!loading && !user && (
        <>
          <NavLink
            onClick={() => setShowNav(false)}
            className={({ isActive }) => (isActive ? "text-blue-500" : "text-heading")}
            to="/signin"
          >
            <li className="hover-underline-animation p-2 font-semibold rounded-xl cursor-pointer flex items-center gap-2">
              <LiaSignInAltSolid className="w-5 h-5" />
              Sign In
            </li>
          </NavLink>

          <NavLink
            onClick={() => setShowNav(false)}
            className={({ isActive }) => (isActive ? "text-blue-500" : "text-heading")}
            to="/register"
          >
            <li className="hover-underline-animation p-2 font-semibold rounded-xl cursor-pointer flex items-center gap-2">
              <FaFileSignature className="w-5 h-5" />
              Register
            </li>
          </NavLink>
        </>
      )}

      {/* Contact */}
      <NavLink
        onClick={() => setShowNav(false)}
        className={({ isActive }) => (isActive ? "text-blue-500" : "text-heading")}
        to="/contact"
      >
        <li className="hover-underline-animation p-2 font-semibold rounded-xl cursor-pointer flex items-center gap-2">
          <TiContacts className="w-5 h-5" />
          Contact
        </li>
      </NavLink>

      {/* Logout */}
      {!loading && user && (
        <li
          onClick={handleLogout}
          className="hover-underline-animation p-2 font-semibold rounded-xl cursor-pointer flex items-center gap-2"
        >
          <AiOutlineLogout className="w-5 h-5" />
          Logout
        </li>
      )}
    </ul>
  );
};

export default NavList;
