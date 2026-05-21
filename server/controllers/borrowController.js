const BorrowRecord = require('../models/BorrowRecord');
const Book = require('../models/Book');

// @desc    Borrow a book
// @route   POST /api/borrow
// @access  Private/Student
exports.borrowBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.availableCopies < 1) {
      return res.status(400).json({ message: 'No copies available' });
    }

    // Check if user already has this book active
    const existingBorrow = await BorrowRecord.findOne({ user: userId, book: bookId, status: 'Active' });
    if (existingBorrow) {
      return res.status(400).json({ message: 'You have already borrowed this book' });
    }

    // Calculate due date (e.g., 14 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const borrowRecord = new BorrowRecord({
      user: userId,
      book: bookId,
      dueDate,
    });

    await borrowRecord.save();

    book.availableCopies -= 1;
    await book.save();

    res.status(201).json(borrowRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Return a book
// @route   POST /api/borrow/return/:id
// @access  Private
exports.returnBook = async (req, res) => {
  try {
    const recordId = req.params.id;
    const record = await BorrowRecord.findById(recordId).populate('book');

    if (!record) {
      return res.status(404).json({ message: 'Borrow record not found' });
    }
    if (record.status === 'Returned') {
      return res.status(400).json({ message: 'Book already returned' });
    }

    // Calculate fine (e.g., $1 per day overdue)
    const today = new Date();
    let fineAmount = 0;
    if (today > record.dueDate) {
      const diffTime = Math.abs(today - record.dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      fineAmount = diffDays * 1; // $1 per day
    }

    record.returnDate = today;
    record.status = 'Returned';
    record.fineAmount = fineAmount;
    await record.save();

    // Increase available copies
    const book = await Book.findById(record.book._id);
    book.availableCopies += 1;
    await book.save();

    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's borrow history
// @route   GET /api/borrow/history
// @access  Private
exports.getMyBorrowHistory = async (req, res) => {
  try {
    const records = await BorrowRecord.find({ user: req.user.id })
      .populate('book', 'title author coverImage')
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all borrow records (Admin)
// @route   GET /api/borrow
// @access  Private/Admin
exports.getAllBorrowRecords = async (req, res) => {
  try {
    const records = await BorrowRecord.find({})
      .populate('user', 'username email branch')
      .populate('book', 'title author')
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
