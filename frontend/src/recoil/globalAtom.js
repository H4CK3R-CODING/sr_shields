// state/authAtom.js
import { atom } from "recoil";

export const authState = atom({
  key: "authState",
  default: {
    user: null,
    loading: true,
  },
});
