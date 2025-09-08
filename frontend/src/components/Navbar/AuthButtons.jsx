import { Link } from "react-router-dom";

function AuthButtons({ state, handleLogout, mobile = false, toggleMenu }) {
  if (state.user) {
    return (
      <div
        className={`flex justify-center items-center ${
          mobile ? "flex-col gap-3 " : "items-center gap-5"
        }`}
      >
        {/* Username */}
        <span className="px-3 py-1 dark:text-white rounded-full font-semibold text-sm shadow-sm">
          👋Welcome {state.user.name}
        </span>

        {/* Admin Panel */}
        {/* {state.user.role === "admin" && (
          <Link
            to="/admin/dashboard"
            onClick={toggleMenu}
            className="min-w-[100px] max-w-[140px] text-center px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-medium shadow-md hover:shadow-lg hover:scale-105 transition"
          >
            Admin Panel
          </Link>
        )} */}

        {/* Logout */}
        <button
          onClick={() => {
            handleLogout();
            if (toggleMenu) toggleMenu();
          }}
          className="min-w-[100px] max-w-[140px] text-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-md hover:shadow-lg hover:scale-105 transition"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div
      className={`flex justify-center items-center ${
        mobile ? "flex-col gap-3 w-full" : "items-center gap-5"
      }`}
    >
      {/* Sign In */}
      <Link
        to="/signin"
        onClick={toggleMenu}
        className="min-w-[100px] max-w-[140px] text-center px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-medium shadow-md hover:shadow-lg hover:scale-105 transition"
      >
        Sign In
      </Link>

      {/* Sign Up */}
      <Link
        to="/signup"
        onClick={toggleMenu}
        className="min-w-[100px] max-w-[140px] text-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-md hover:shadow-lg hover:scale-105 transition"
      >
        Sign Up
      </Link>
    </div>
  );
}

export default AuthButtons;
