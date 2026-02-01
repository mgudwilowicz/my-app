const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/marti', (req, res) => {
  res.send('Hello Marti!');
});

app.listen(port, () => {
  console.log(`MyApp backend listening on port ${port}`);
});
