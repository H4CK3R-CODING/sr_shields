import NavLinks from "./NavLinks";
import AuthButtons from "./AuthButtons";
import ThemeToggle from "./ThemeToggle";
import SocialLinks from "./SocialLinks";

function MobileMenu({ isOpen, state, handleLogout, toggleMenu, theme, toggleTheme }) {
  return (
    <div
      className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${
        isOpen ? "max-h-96 mt-2" : "max-h-0"
      }`}
    >
      <div className="shadow-lg px-4 pt-4 pb-6 space-y-4 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-200 dark:from-sky-950 dark:via-indigo-900 dark:to-purple-950">
        <NavLinks onClick={toggleMenu} />
        <AuthButtons state={state} handleLogout={handleLogout} mobile toggleMenu={toggleMenu} />
        <div className="flex items-center justify-between mt-2">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <SocialLinks />
        </div>
      </div>
    </div>
  );
}

export default MobileMenu;
