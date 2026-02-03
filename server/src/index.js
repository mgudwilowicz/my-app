const express = require('express');
const db = require('./db');
const bcrypt = require('bcrypt');
const { generateAccessToken } = require('./jwt');
const authenticateToken = require('./auth');

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from myApp!');
});

app.post('/register', async (req, res) => {
  console.log('/register called');

  const { email, password } = req.body;
  console.log('🚀 ~  email, password :', email, password);

  if (!email || !password) {
    console.log('email/password do not exist');
    return res.status(400).json({ error: 'Email and password required!' });
  }
  if (password.length < 6) {
    console.log('password too short');
    return res
      .status(400)
      .json({ error: 'Password must be at least 6 characters long!' });
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    console.log('invalid email');
    return res.status(400).json({ error: 'Invalid email format!' });
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('password hashed');

    const query = `
      INSERT INTO users (email, password)
      VALUES (?, ?)
    `;

    db.run(query, [email, hashedPassword], function (err) {
      if (err) {
        console.log('User exists');
        return res.status(400).json({ error: 'User already exists' });
      }
      console.log('success');
      res.status(201).json({ message: 'User registered successfully' });
    });
  } catch (err) {
    console.log('server error');
    res.status(500).json({ error: err.message });
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log('🚀 ~  email, password:', email, password);

  const query = `SELECT * FROM users WHERE email = ?`;

  db.get(query, [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }

    console.log('🚀 ~ user:', user);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const isValid = bcrypt.compareSync(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // Generate JWT token
    const token = generateAccessToken(user);

    res.json({
      message: 'Login successful',
      userId: user.id,
      email: user.email,
      token: token,
    });
  });
});

// Get all users
app.get('/users', authenticateToken, (req, res) => {
  console.log('🚀 ~ req:', req.user);
  db.all(`SELECT name FROM users`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.listen(port, () => {
  console.log(`MyApp backend listening on port ${port}`);
});
