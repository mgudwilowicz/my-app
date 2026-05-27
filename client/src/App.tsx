import { useUserContext } from "./context/UserContext";
import Login from "./pages/Login";
import Families from "./pages/Families";
import Dashboard from "./pages/Dashboard";
import AllMedications from "./pages/AllMedications";
import ManageMedications from "./pages/ManageMedications";
import Members from "./pages/Members";
import Reports from "./pages/Reports";
import ProfileSettings from "./pages/ProfileSettings";
import { Route, Routes } from "react-router";
import Register from "./pages/Register";
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
    <>
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
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/all-medications"
          element={
            <ProtectedRoute>
              <AllMedications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-medications"
          element={
            <ProtectedRoute>
              <ManageMedications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/members"
          element={
            <ProtectedRoute>
              <Members />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile-settings"
          element={
            <ProtectedRoute>
              <ProfileSettings />
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
    </>
  );
}

export default App;
