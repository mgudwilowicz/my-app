import React, { useState } from 'react';
import { useUserContext } from '../context/UserContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useUserContext();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <form
      onSubmit={handleLogin}
      style={{
        display: 'flex',
        flexDirection: 'column',
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
  );
}

export default Login;
