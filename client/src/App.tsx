import { useUserContext } from "./context/UserContext";
import Login from "./components/Login";
import Families from "./components/Families";
import { Route, Routes } from "react-router";
import Register from "./components/Register";
import ProtectedRoute from "./ProtectedRoute";

// const API_HOST = import.meta.env.VITE_PUBLIC_API_HOST;

function App() {
  const { isInitialized, currentUser } = useUserContext();
  console.log("🚀 ~ App ~ currentUser:", currentUser);
  console.log("🚀 ~ App ~ isInitialized:", isInitialized);

  if (!isInitialized) {
    console.log("initialization in progress...");
    null;
  }

  // Wie kann ich nicht eingeloggte user nach login weiterleiten, wenn sie versuchen, auf die home page zuzugreifen?
  // if (!currentUser) {
  //   navigate("/login");
  // }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Families />
          </ProtectedRoute>
        }
      />
      <Route
        path="/test"
        element={
          <ProtectedRoute>
            <main>
              <h1>Test</h1>
            </main>
          </ProtectedRoute>
        }
      />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<p>Page not found</p>} />
    </Routes>
  );
}

export default App;
