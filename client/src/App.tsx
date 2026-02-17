import { useState } from "react";
import "./App.css";

type User = {
  email: string;
};

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState<User[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      if (!response.ok) {
        throw new Error("server error");
      }
      const data = await response.json();
      setToken(data.accessToken);
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  }

  async function loadData() {
    try {
      const response = await fetch("http://localhost:3000/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("server error");
      }
      const data = await response.json();
      setUsers(data);
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      <h1>Demo App</h1>
      {!token && (
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <input
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            className="form-input"
            type="text"
          />
          <input
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            className="form-input"
            type="password"
          />
          <button>Log in</button>
        </form>
      )}
      {token && (
        <>
          <button onClick={loadData}>Load user data</button>
          <button onClick={() => setToken(null)}>Log out</button>
          {users.map((user) => {
            return <p>{user.email}</p>;
          })}
        </>
      )}
    </>
  );
}

export default App;
