// state/authAtom.js
import { atom } from "recoil";

const token = localStorage.getItem("token");

export const authState = atom({
  key: "authState",
  default: {
    user: null,
    loading: !!token, // ✅ if token exists, start in loading state
  },

});

export const showNavAtom = atom({
    key: "showNavAtom",
    default: false
});

export const openDashboardAtom = atom({
    key: "openDashboardAtom",
    default: false
})
