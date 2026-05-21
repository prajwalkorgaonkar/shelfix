const express = require('express');
const router = express.Router();
const { borrowBook, returnBook, getMyBorrowHistory, getAllBorrowRecords } = require('../controllers/borrowController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, borrowBook);
router.post('/return/:id', protect, returnBook);
router.get('/history', protect, getMyBorrowHistory);
router.get('/', protect, adminOnly, getAllBorrowRecords);

module.exports = router;
