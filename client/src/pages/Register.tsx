import React, { useState } from "react";
import { useUserContext } from "../context/UserContext";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Alert, Box } from "@mui/material";
import { Navigate } from "react-router";

function Register() {
  const { currentUser } = useUserContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { register, error } = useUserContext();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    register(email, password, name);
  };

  if (currentUser) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <Box
        component="form"
        onSubmit={handleRegister}
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
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          required
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          label="Name"
          variant="outlined"
          required
          onChange={(e) => setName(e.target.value)}
        />

        <Button variant="outlined" color="primary" type="submit">
          Register
        </Button>
        <Button variant="text" href="/login">
          Already have an account? Login here
        </Button>
      </Box>
    </>
  );
}
export default Register;
