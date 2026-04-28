const express = require('express');
const router = express.Router();
const { getDb } = require('../models/database');

const PAGE_SIZE = 10;

router.get('/', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const db = getDb();

  const countRow = db.prepare(`
    SELECT COUNT(*) as total
    FROM orders
    JOIN books ON orders.isbn = books.isbn
    JOIN employees ON orders.emp_no = employees.emp_no
  `).get();

  const totalCount = countRow.total;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const currentPage = Math.min(page, totalPages);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const books = db.prepare(`
    SELECT
      orders.id || '-' || orders.branch AS no,
      orders.id,
      orders.branch,
      books.title,
      books.subtitle,
      books.writer,
      books.print,
      orders.recorddate,
      employees.post,
      employees.name,
      orders.buy,
      orders.price
    FROM orders
    JOIN books ON orders.isbn = books.isbn
    JOIN employees ON orders.emp_no = employees.emp_no
    ORDER BY CAST(orders.id AS INTEGER), CAST(orders.branch AS INTEGER)
    LIMIT ? OFFSET ?
  `).all(PAGE_SIZE, offset);

  res.json({
    totalCount,
    totalPages,
    currentPage,
    books,
  });
});

module.exports = router;
