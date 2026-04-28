const express = require('express');
const path = require('path');
const { closeDb } = require('./models/database');
const booklistRoute = require('./routes/booklistRoute');
const bookdetailRoute = require('./routes/bookdetailRoute');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/books', booklistRoute);
app.use('/api/book', bookdetailRoute);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.get('/detail', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'detail.html'));
});

const server = app.listen(PORT, () => {
  console.log(`書籍管理システム サーバ起動: http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  closeDb();
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDb();
  server.close();
  process.exit(0);
});
