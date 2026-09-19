import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

function NavLinks({ onClick }) {
  const [transactionOpen, setTransactionOpen] = useState(false);

  // Main navigation links
  const links = [
    {
      label: "Home",
      route: "/",
    },
    {
      label: "About",
      route: "/about",
    },
    {
      label: "Contact",
      route: "/contact",
    },
    {
      label: "Developer",
      route: "/developer",
    },
  ];

  // Transaction dropdown links
  const transactionLinks = [
    {
      label: "Add Transaction",
      route: "/add-transaction",
      description: "Create a new transaction",
      icon: "+",
      iconClass:
        "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300",
    },
    {
      label: "Transaction Report",
      route: "/transaction-report",
      description: "View transaction history",
      icon: "📊",
      iconClass:
        "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300",
    },
  ];

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
    });
  }, []);

  return (
    <div className="flex flex-col xl:flex-row xl:flex-wrap xl:gap-6 gap-4 items-center">
      
      {/* Main Navigation */}
      {links.map((item, index) => (
        <Link
          key={item.label}
          to={item.route}
          onClick={onClick}
          className="relative text-gray-900 dark:text-gray-100 font-medium group transition hover:-translate-y-1 hover:scale-105 hover:text-blue-600 dark:hover:text-blue-300"
          data-aos="fade-up"
          data-aos-delay={index * 150}
        >
          {item.label}

          <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-500 dark:bg-blue-300 transition-all group-hover:w-full"></span>
        </Link>
      ))}

      {/* Transactions Dropdown */}
      <div
        className="relative"
        onMouseEnter={() => setTransactionOpen(true)}
        onMouseLeave={() => setTransactionOpen(false)}
        data-aos="fade-up"
        data-aos-delay={600}
      >
        <button
          type="button"
          onClick={() => setTransactionOpen(!transactionOpen)}
          className="relative flex items-center gap-1 text-gray-900 dark:text-gray-100 font-medium group transition hover:-translate-y-1 hover:scale-105 hover:text-blue-600 dark:hover:text-blue-300"
        >
          Transactions

          <svg
            className={`w-4 h-4 transition-transform duration-300 ${
              transactionOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>

          <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-500 dark:bg-blue-300 transition-all group-hover:w-full"></span>
        </button>

        {/* Dropdown Menu */}
        <div
          className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 rounded-xl overflow-hidden
          bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl
          border border-gray-200 dark:border-gray-700
          shadow-xl shadow-black/10
          transition-all duration-300 origin-top z-50
          ${
            transactionOpen
              ? "opacity-100 scale-100 visible"
              : "opacity-0 scale-95 invisible"
          }`}
        >
          {transactionLinks.map((item) => (
            <Link
              key={item.label}
              to={item.route}
              onClick={onClick}
              className="flex items-center gap-3 px-4 py-3 text-gray-800 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-300 transition"
            >
              {/* Icon */}
              <span
                className={`flex items-center justify-center w-9 h-9 rounded-lg font-semibold ${item.iconClass}`}
              >
                {item.icon}
              </span>

              {/* Text */}
              <div>
                <p className="font-medium">{item.label}</p>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NavLinks;