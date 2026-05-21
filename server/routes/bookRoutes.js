const express = require('express');
const router = express.Router();
const { getBooks, getBookById, addBook, updateBook, deleteBook } = require('../controllers/bookController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/')
  .get(getBooks)
  .post(protect, adminOnly, addBook);

router.route('/:id')
  .get(getBookById)
  .put(protect, adminOnly, updateBook)
  .delete(protect, adminOnly, deleteBook);

module.exports = router;
