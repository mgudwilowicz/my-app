import React, { useState } from "react";
import { useUserContext } from "../context/UserContext";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Alert, Box } from "@mui/material";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { register } = useUserContext();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await register(email, password);
    if ("error" in response) {
      setError(response.error);
    } else {
      setError(null);
    }
    console.log("🚀 ~ handleRegister ~ response:", response);
  };

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
