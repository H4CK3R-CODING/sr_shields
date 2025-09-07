import Logo from "./Logo";
import NavList from "./NavList";
import Theme from "./Theme";
import "../../Style/Navbar.css";

import { useRecoilValue } from "recoil";
import { showNavAtom } from "../../recoil/globalAtom";

const Navbar1 = () => {
  const showNav = useRecoilValue(showNavAtom);

  return (
    <div className="fixed top-0 w-full h-20 flex justify-center items-center z-40">
      <div className="absolute top-0 w-full p-6 z-30">
        <div
          className={`flex justify-between gap-3 items-center w-full border-b-2 h-full relative 
          ${showNav ? "rounded-t-2xl" : "rounded-2xl"} lg:rounded-2xl
          bg-gradient-to-br from-indigo-200 to-purple-200 
          dark:from-sky-950 dark:via-indigo-900 dark:to-purple-950`}
        >
          <Logo />
          <NavList />
          <Theme />
        </div>
      </div>
    </div>
  );
};

export default Navbar1;
