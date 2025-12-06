import "bootstrap/dist/css/bootstrap.min.css";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { StrictMode } from "react";
import LoginContext from "./contexts/LoginContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
  {/* provide LoginContext to app */}
    <LoginContext>
      <App />
    </LoginContext>
  </StrictMode>
);
