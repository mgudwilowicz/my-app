import React, { useState } from 'react';
import { useUserContext } from '../context/UserContext';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Typography, Box } from '@mui/material';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useUserContext();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <>
      <Box
        sx={{
          width: '100%',
          bgcolor: 'primary.main',
          color: 'white',
          p: 2,
          mb: 4,
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: 'row',
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          MedAlert
        </Typography>
      </Box>
      <Box
        component="form"
        onSubmit={handleLogin}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
          mt: 4,
        }}
      >
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
      </Box>
    </>
  );
}
export default Login;
