const express = require('express');
const db = require('./db');

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from myApp!');
});

// Create user
app.post('/users', (req, res) => {
  const { name, email } = req.body;

  const query = `INSERT INTO users (name, email) VALUES (?, ?)`;

  db.run(query, [name, email], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ id: this.lastID, name, email });
  });
});

// Get all users
app.get('/users', (req, res) => {
  db.all(`SELECT * FROM users`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.listen(port, () => {
  console.log(`MyApp backend listening on port ${port}`);
});
