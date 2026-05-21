const fs = require('fs');
let c = fs.readFileSync('client/src/data/mockData.js', 'utf8');

const appendCode = `
// Dynamic Calculations
Object.keys(branchConfig).forEach(key => {
  const booksForBranch = key === 'all' ? mockBooks : mockBooks.filter(b => b.branch === key);
  branchConfig[key].totalBooks = booksForBranch.length.toLocaleString();
  const activeBorrows = booksForBranch.reduce((acc, book) => acc + Math.max(0, 15 - book.availableCopies), 0);
  branchConfig[key].activeBorrows = activeBorrows.toLocaleString();
});
`;

if (!c.includes('// Dynamic Calculations')) {
  c += appendCode;
  fs.writeFileSync('client/src/data/mockData.js', c, 'utf8');
  console.log("Appended dynamic calculations.");
} else {
  console.log("Already appended.");
}
