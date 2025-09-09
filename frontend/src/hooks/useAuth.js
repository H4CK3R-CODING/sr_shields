// hooks/useAuth.js
import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { authState } from "../recoil/globalAtom";
import axios from "axios";

export const useAuth = () => {
  const [state, setState] = useRecoilState(authState);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setState({ user: null, loading: false });
      return;
    }

    // Start verifying with backend
    setState((prev) => ({ ...prev, loading: true }));
    // console.log(`${import.meta.env.VITE_BACKENDURL}`)

    axios
      .get(`${import.meta.env.VITE_BACKENDURL}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        // Check backend response: user must exist
        // console.log(res.data)
        if (res?.data) {
          setState({ user: res?.data, loading: false });
        } else {
          localStorage.removeItem("token");
          setState({ user: null, loading: false });
        }
      })
      .catch(() => {
        console.error("Auth failed:", err);
        localStorage.removeItem("token");
        setState({ user: null, loading: false });
      });
  }, [setState]);

  return state;
};
