import { Link } from "react-router-dom";

function NavLinks({ onClick }) {
  const links = ["Home", "About", "Contact"];
  return (
    <div className="flex flex-col lg:flex-row lg:space-x-6 space-y-4 lg:space-y-0 items-center">
      {links.map((item) => (
        <Link
          key={item}
          to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
          onClick={onClick}
          className="relative text-gray-900 dark:text-gray-100 font-medium group transition"
        >
          {item}
          <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-500 dark:bg-blue-300 transition-all group-hover:w-full"></span>
        </Link>
      ))}
    </div>
  );
}

export default NavLinks;
