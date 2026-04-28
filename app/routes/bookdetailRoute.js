const express = require('express');
const router = express.Router();
const { getDb } = require('../models/database');
const { getThumbnailByIsbn } = require('../services/googleBooksApi');

router.get('/:id/:branch', async (req, res) => {
  const { id, branch } = req.params;
  const db = getDb();

  const book = db.prepare(`
    SELECT
      orders.id || '-' || orders.branch AS no,
      orders.id,
      orders.branch,
      books.title,
      books.subtitle,
      books.writer,
      books.print,
      books.isbn,
      orders.recorddate,
      employees.post,
      employees.name,
      orders.buy,
      orders.price
    FROM orders
    JOIN books ON orders.isbn = books.isbn
    JOIN employees ON orders.emp_no = employees.emp_no
    WHERE orders.id = ? AND orders.branch = ?
  `).get(id, branch);

  if (!book) {
    return res.status(404).json({ error: '書籍が見つかりません' });
  }

  const thumbnail = await getThumbnailByIsbn(book.isbn);

  res.json({
    ...book,
    thumbnail,
  });
});

module.exports = router;
