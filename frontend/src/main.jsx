import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { RecoilRoot } from "recoil";
import {
  BrowserRouter as Router
} from "react-router-dom";

// aos
import "aos/dist/aos.css";
import "react-loading-skeleton/dist/skeleton.css";
import AOS from "aos";
AOS.init({ duration: 1000, once: true });

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RecoilRoot>
      <Router>
        <App />
      </Router>
    </RecoilRoot>
  </StrictMode>
);
