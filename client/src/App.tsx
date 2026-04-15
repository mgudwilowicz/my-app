import { useUserContext } from "./context/UserContext";
import Login from "./components/Login";
import Header from "./components/Header";
import Families from "./components/Families";

// const API_HOST = import.meta.env.VITE_PUBLIC_API_HOST;

function App() {
  const { isInitialized, currentUser, error } = useUserContext();

  if (!isInitialized) {
    null;
  }

  if (!currentUser) {
    return <Login />;
  }

  return (
    <main>
      <Header />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <Families />
    </main>
  );
}

export default App;
