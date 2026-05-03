import { useUserContext } from "./context/UserContext";
import Login from "./components/Login";
import Families from "./components/Families";
import { Route, Routes, useNavigate } from "react-router";
import Register from "./components/Register";

// const API_HOST = import.meta.env.VITE_PUBLIC_API_HOST;

function App() {
  const { isInitialized, currentUser, error } = useUserContext();
  const navigate = useNavigate();
  if (!isInitialized) {
    null;
  }

  // Wie kann ich nicht eingeloggte user nach login weiterleiten, wenn sie versuchen, auf die home page zuzugreifen?
  if (!currentUser) {
    navigate("/login");
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <main>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <Families />
          </main>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<p>Page not found</p>} />
    </Routes>
  );
}

export default App;
