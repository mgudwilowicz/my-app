import React, { useEffect, useState } from "react";
import { useUserContext } from "../context/UserContext";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Alert, Box } from "@mui/material";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { finalizeInvite } from "../api/invite";

function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const invitedEmail = searchParams.get("email");

  const { currentUser } = useUserContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [inviteComplete, setInviteComplete] = useState(false);
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
      try {
        await finalizeInvite(inviteToken, data.accessToken);
        setInviteComplete(true);
        navigate("/");
      } catch (err) {
        setLocalError(
          err instanceof Error ? err.message : "Could not join family",
        );
      }
      return;
    }

    navigate("/");
  };

  if (currentUser && (!inviteToken || inviteComplete)) {
    return <Navigate to="/" />;
  }

  const loginHref = inviteToken
    ? `/login?invite=${encodeURIComponent(inviteToken)}&email=${encodeURIComponent(email)}`
    : "/login";

  return (
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
      {inviteToken && (
        <Alert severity="info" sx={{ maxWidth: 400 }}>
          Create an account to join the family group.
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
        disabled={Boolean(invitedEmail)}
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
      <Button variant="text" component={Link} to={loginHref}>
        Already have an account? Login here
      </Button>
    </Box>
  );
}
export default Register;
