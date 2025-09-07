import { IoLogoGithub } from "react-icons/io";
import { CiLinkedin } from "react-icons/ci";
import { IoMailOpenOutline } from "react-icons/io5";

const SocailLink = () => {
  return (
    <div className="flex items-center gap-2">
      <IoLogoGithub onClick={()=>{
        window.open("https://github.com/H4CK3R-CODING")
      }} className="w-7 h-7 cursor-pointer text-heading " />
      <CiLinkedin onClick={()=>{
        window.open("https://www.linkedin.com/in/gaurav-rathour-85b878264/")
      }}  className="w-7 h-7 cursor-pointer text-heading " />
      <IoMailOpenOutline onClick={()=>{
        window.open("mailto:gauravrathouor0786@gmail.com")
      }}  className="w-7 h-7 cursor-pointer text-heading " />
    </div>
  );
};

export default SocailLink;
