import { IoLogoGithub } from "react-icons/io";
import { CiLinkedin } from "react-icons/ci";
import { IoMailOpenOutline } from "react-icons/io5";
import { SiInstagram, SiWhatsapp } from "react-icons/si";

function SocialLinks() {
  return (
    <div className="flex items-center gap-2 dark:text-white">
      <SiInstagram
    onClick={() => window.open("https://www.instagram.com/iam_sr______/")}
    className="w-8 h-8 cursor-pointer text-pink-500 hover:text-pink-400 transition-colors duration-300"
  />
  <SiWhatsapp
    onClick={() => window.open("https://wa.me/+918607550898")}
    className="w-8 h-8 cursor-pointer text-green-500 hover:text-green-400 transition-colors duration-300"
  />
  <IoMailOpenOutline
    onClick={() => window.open("mailto:souravrathour02@gmail.com")}
    className="w-8 h-8 cursor-pointer text-blue-500 hover:text-blue-400 transition-colors duration-300"
  />
    </div>
  );
}

export default SocialLinks;
