// In-memory database for when MongoDB is not available
const database = {
  users: [
    {
      id: 'usr_admin',
      username: 'admin1',
      email: 'admin@shelfix.com',
      password: '$2b$10$hash', // bcrypt hash would go here
      department: 'System Operations',
      role: 'Admin',
      createdAt: new Date()
    },
    {
      id: 'usr_student',
      username: 'cs2025',
      email: 'student@shelfix.com',
      password: '$2b$10$hash',
      department: 'Computer Science',
      role: 'Student',
      createdAt: new Date()
    }
  ],
  books: [],
  borrowRecords: []
};

module.exports = database;
