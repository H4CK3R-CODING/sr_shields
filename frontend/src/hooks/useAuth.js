import { useEffect } from "react";
import { useRecoilState } from "recoil";
import axios from "axios";
import { authState } from "../recoil/globalAtom";

export const useAuth = () => {
  const [auth, setAuth] = useRecoilState(authState);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser && savedUser !== "undefined") {
      try {
        setAuth({ user: JSON.parse(savedUser), loading: true });
      } catch (e) {
        console.error("Invalid user data in localStorage", e);
        localStorage.removeItem("user");
      }
    }

    const verifyUser = async () => {
      try {
        const res = await axios.get("/api/auth/me", { withCredentials: true });
        setAuth({ user: res.data.user, loading: false });
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } catch (err) {
        setAuth({ user: null, loading: false });
        localStorage.removeItem("user");
      }
    };

    verifyUser();
  }, [setAuth]);

  return auth;
};
