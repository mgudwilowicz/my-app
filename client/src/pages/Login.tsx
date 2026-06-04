import React, { useEffect, useState } from "react";
import { useUserContext } from "../context/UserContext";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Alert, Box } from "@mui/material";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { fetchInvitePreview } from "../api/invite";

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const invitedEmail = searchParams.get("email");

  const { currentUser } = useUserContext();
  const [email, setEmail] = useState(invitedEmail ?? "");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const { login, error } = useUserContext();

  useEffect(() => {
    if (!inviteToken || invitedEmail) return;
    fetchInvitePreview(inviteToken)
      .then((preview) => setEmail(preview.email))
      .catch(() => {});
  }, [inviteToken, invitedEmail]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    const data = await login(email, password);
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

  const registerHref = inviteToken
    ? `/register?invite=${encodeURIComponent(inviteToken)}&email=${encodeURIComponent(email)}`
    : "/register";

  return (
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
      {inviteToken && (
        <Alert severity="info" sx={{ maxWidth: 400 }}>
          Log in to join the family group.
        </Alert>
      )}
      {(error || localError) && (
        <Alert severity="error">{localError || error}</Alert>
      )}
      <TextField
        label="Email"
        variant="outlined"
        required
        value={email}
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
        Login
      </Button>
      <Button variant="text" component={Link} to={registerHref}>
        No account? Register here
      </Button>
    </Box>
  );
}
export default Login;
