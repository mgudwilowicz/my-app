import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { UserProvider } from "./context/UserProvider";
import { BrowserRouter } from "react-router";
import Header from "./components/Header";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <UserProvider>
        <Header />
        <App />
      </UserProvider>
    </BrowserRouter>
  </StrictMode>,
);
