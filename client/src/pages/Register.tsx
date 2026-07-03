import React, { useEffect, useState } from "react";
import { useUserContext } from "../context/UserContext";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Alert, Box } from "@mui/material";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import AuthLayout from "../components/auth/AuthLayout";

function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const invitedEmail = searchParams.get("email");

  const { currentUser } = useUserContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const { register, error } = useUserContext();

  useEffect(() => {
    if (invitedEmail) {
      setEmail(invitedEmail);
    }
  }, [invitedEmail]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    const data = await register(email, password, name);
    if (!data?.accessToken) return;

    if (inviteToken) {
      navigate(`/accept-invite/${encodeURIComponent(inviteToken)}`);
      return;
    }

    navigate("/families");
  };

  if (currentUser) {
    if (inviteToken) {
      return <Navigate to={`/accept-invite/${encodeURIComponent(inviteToken)}`} />;
    }
    return <Navigate to="/families" />;
  }

  const loginHref = inviteToken
    ? `/login?invite=${encodeURIComponent(inviteToken)}&email=${encodeURIComponent(email)}`
    : "/login";

  return (
    <AuthLayout title="Create account" subtitle="Start managing medications together">
      <Box
        component="form"
        onSubmit={handleRegister}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {inviteToken && (
          <Alert severity="info">Create an account to join the family group.</Alert>
        )}
        {(error || localError) && (
          <Alert severity="error">{localError || error}</Alert>
        )}
        <TextField
          label="Email"
          variant="outlined"
          required
          fullWidth
          value={email}
          disabled={Boolean(invitedEmail)}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          required
          fullWidth
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          label="Name"
          variant="outlined"
          required
          fullWidth
          onChange={(e) => setName(e.target.value)}
        />

        <Button variant="contained" color="primary" type="submit" fullWidth>
          Register
        </Button>
        <Button variant="text" component={Link} to={loginHref} fullWidth>
          Already have an account? Log in here
        </Button>
      </Box>
    </AuthLayout>
  );
}
export default Register;
