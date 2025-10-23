const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());

app.get('/items', (req, res) => {
  res.json({
    foods: ["tomatoes", "apples", "banana"],
    furniture: ["chairs", "tables", "fans", "sofas"]
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});