// In-memory database for when MongoDB is not available
const database = {
  users: [],
  books: [],
  borrowRecords: []
};

module.exports = database;
