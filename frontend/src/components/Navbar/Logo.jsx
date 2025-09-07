import { Link } from "react-router-dom";
// import { LuLayoutDashboard } from "react-icons/lu";
import { useRecoilState, useSetRecoilState } from "recoil";
import { authState, openDashboardAtom, showNavAtom } from "../../recoil/globalAtom";

function Logo() {
  const [state] = useRecoilState(authState);
  const [openDashboard, setOpenDashboard] = useRecoilState(openDashboardAtom);
  const setShowNav = useSetRecoilState(showNavAtom);

  return (
    <div className="flex items-center gap-2">
      {state.user && (
        <div
          onClick={() => {
            setOpenDashboard(!openDashboard);
            setShowNav(false);
          }}
          className="cursor-pointer transition-all duration-300"
        >
          {/* <LuLayoutDashboard className="text-3xl text-indigo-700 dark:text-white hover:text-purple-700 dark:hover:text-indigo-300" /> */}
        </div>
      )}
      <Link
        to="/"
        className="flex select-none cursor-pointer items-center sm:p-2 sm:m-2 sm:border-2 rounded-full"
      >
        <img className="w-8 rounded-full sm:w-10" src="./icon.jpeg" alt="logo" />
        <span className="hidden sm:block sm:text-xl ml-2 dark:text-white">
          SR's🛡️Sʜɪᴇʟᴅ
        </span>
      </Link>
    </div>
  );
}

export default Logo;
