import React, { useState } from "react";
import { useUserContext } from "../context/UserContext";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Alert, Box } from "@mui/material";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, error } = useUserContext();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={handleLogin}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          mt: 4,
        }}
      >
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Email"
          variant="outlined"
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button variant="outlined" color="primary" type="submit">
          Login
        </Button>
        <Button variant="text" href="/register">
          No account? Register here
        </Button>
      </Box>
    </>
  );
}
export default Login;
