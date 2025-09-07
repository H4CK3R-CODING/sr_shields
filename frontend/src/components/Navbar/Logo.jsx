import { Link } from "react-router-dom";
import { LuLayoutDashboard } from "react-icons/lu";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { openDashboardAtom, showNavAtom, authState } from "../../recoil/globalAtom";

const Logo = () => {
  const [openDashboard, setOpenDashboard] = useRecoilState(openDashboardAtom);
  const setShowNav = useSetRecoilState(showNavAtom);
  const auth = useRecoilValue(authState);
  const { user } = auth; // check if user is logged in
  const theme = "light"; // you can also replace with seletedThemeAtom if needed

  return (
    <div className="flex justify-center items-center gap-1 px-1 ml-2 z-40">
      {/* Dashboard Icon shows only if user is logged in */}
      {user && (
        <div
          onClick={() => {
            setOpenDashboard(!openDashboard);
            setShowNav(false);
          }}
          className={`mr-2 flex items-center group cursor-pointer transition-all duration-300 ease-in-out`}
        >
          <LuLayoutDashboard
            className={`text-3xl cursor-pointer ${
              theme === "light"
                ? "text-indigo-700 hover:text-purple-700"
                : "text-white hover:text-indigo-300"
            } transition-colors duration-300`}
          />
        </div>
      )}

      {/* Logo */}
      <div>
        <Link
          to={"/"}
          className="flex justify-center items-center sm:p-2 sm:m-2 sm:border-2 rounded-full"
        >
          <img className="w-8 sm:w-10" src="./logo.png" alt="logo" />
          <span className="hidden sm:block sm:text-xl text-heading text-md">
            StudySpotlight
          </span>
        </Link>
      </div>
    </div>
  );
};

export default Logo;
