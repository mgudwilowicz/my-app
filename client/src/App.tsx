import { useUserContext } from "./context/UserContext";
import Login from "./components/Login";
import Header from "./components/Header";
import Families from "./components/Families";

// const API_HOST = import.meta.env.VITE_PUBLIC_API_HOST;

function App() {
  const { currentUser, error } = useUserContext();

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
