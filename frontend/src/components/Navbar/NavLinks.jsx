import { Link } from "react-router-dom";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

function NavLinks({ onClick }) {
  const links = ["Home", "About", "Contact", "Announcements", "Developer"];

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true, // animation occurs only once
    });
  }, []);

  return (
    <div className="flex flex-col xl:flex-row xl:flex-wrap xl:gap-6 gap-4 items-center">
      {links.map((item, index) => (
        <Link
          key={item}
          to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
          onClick={onClick}
          className="relative text-gray-900 dark:text-gray-100 font-medium group transition hover:-translate-y-1 hover:scale-105 hover:text-blue-600 dark:hover:text-blue-300"
          data-aos="fade-up"
          data-aos-delay={index * 150}
        >
          {item}
          <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-500 dark:bg-blue-300 transition-all group-hover:w-full"></span>
        </Link>
      ))}
    </div>
  );
}

export default NavLinks;
