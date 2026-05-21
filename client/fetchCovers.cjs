const https = require('https');
const fs = require('fs');

const books = [
  { id: 'rec_1', title: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling", category: "Fantasy", rating: 4.9, availableCopies: 12 },
  { id: 'rec_2', title: "A Game of Thrones", author: "George R.R. Martin", category: "Fantasy", rating: 4.8, availableCopies: 8 },
  { id: 'rec_3', title: "The Hobbit", author: "J.R.R. Tolkien", category: "Fantasy", rating: 4.9, availableCopies: 15 },
  { id: 'rec_4', title: "The Fellowship of the Ring", author: "J.R.R. Tolkien", category: "Fantasy", rating: 4.9, availableCopies: 5 },
  { id: 'rec_5', title: "Atomic Habits", author: "James Clear", category: "Self-Help", rating: 4.8, availableCopies: 20 },
  { id: 'rec_6', title: "Rich Dad Poor Dad", author: "Robert T. Kiyosaki", category: "Finance", rating: 4.7, availableCopies: 10 },
  { id: 'rec_7', title: "1984", author: "George Orwell", category: "Fiction", rating: 4.8, availableCopies: 7 },
  { id: 'rec_8', title: "Dune", author: "Frank Herbert", category: "Sci-Fi", rating: 4.7, availableCopies: 9 },
  { id: 'rec_9', title: "Sapiens: A Brief History of Humankind", author: "Yuval Noah Harari", category: "History", rating: 4.8, availableCopies: 14 },
  { id: 'rec_10', title: "The Lightning Thief", author: "Rick Riordan", category: "Fantasy", rating: 4.8, availableCopies: 11 },
  { id: 'rec_11', title: "The Hunger Games", author: "Suzanne Collins", category: "Sci-Fi", rating: 4.7, availableCopies: 6 },
  { id: 'rec_12', title: "The Adventures of Sherlock Holmes", author: "Arthur Conan Doyle", category: "Mystery", rating: 4.7, availableCopies: 4 },
  { id: 'rec_13', title: "The Alchemist", author: "Paulo Coelho", category: "Fiction", rating: 4.6, availableCopies: 18 },
  { id: 'rec_14', title: "The Psychology of Money", author: "Morgan Housel", category: "Finance", rating: 4.8, availableCopies: 13 },
  { id: 'rec_15', title: "Ikigai", author: "Héctor García", category: "Self-Help", rating: 4.7, availableCopies: 9 },
  { id: 'rec_16', title: "Thinking, Fast and Slow", author: "Daniel Kahneman", category: "Psychology", rating: 4.6, availableCopies: 7 },
  { id: 'rec_17', title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Classic", rating: 4.5, availableCopies: 15 },
  { id: 'rec_18', title: "To Kill a Mockingbird", author: "Harper Lee", category: "Classic", rating: 4.8, availableCopies: 12 },
  { id: 'rec_19', title: "Pride and Prejudice", author: "Jane Austen", category: "Romance", rating: 4.7, availableCopies: 8 },
  { id: 'rec_20', title: "The Catcher in the Rye", author: "J.D. Salinger", category: "Classic", rating: 4.4, availableCopies: 5 },
  { id: 'rec_21', title: "Fahrenheit 451", author: "Ray Bradbury", category: "Sci-Fi", rating: 4.6, availableCopies: 10 },
  { id: 'rec_22', title: "The 7 Habits of Highly Effective People", author: "Stephen R. Covey", category: "Self-Help", rating: 4.7, availableCopies: 11 },
  { id: 'rec_23', title: "Start with Why", author: "Simon Sinek", category: "Business", rating: 4.6, availableCopies: 8 },
  { id: 'rec_24', title: "Meditations", author: "Marcus Aurelius", category: "Philosophy", rating: 4.7, availableCopies: 14 },
  { id: 'rec_25', title: "The Subtle Art of Not Giving a F*ck", author: "Mark Manson", category: "Self-Help", rating: 4.5, availableCopies: 16 },
  { id: 'rec_26', title: "Dare to Lead", author: "Brené Brown", category: "Leadership", rating: 4.7, availableCopies: 9 },
  { id: 'rec_27', title: "Essentialism", author: "Greg McKeown", category: "Self-Help", rating: 4.6, availableCopies: 7 },
  { id: 'rec_28', title: "The 48 Laws of Power", author: "Robert Greene", category: "Psychology", rating: 4.6, availableCopies: 6 },
  { id: 'rec_29', title: "Good to Great", author: "Jim Collins", category: "Business", rating: 4.6, availableCopies: 8 },
  { id: 'rec_30', title: "Principles", author: "Ray Dalio", category: "Business", rating: 4.7, availableCopies: 12 }
];

async function fetchCoverUrl(title, author) {
  const query = encodeURIComponent('intitle:' + title + ' inauthor:' + author);
  const url = 'https://www.googleapis.com/books/v1/volumes?q=' + query + '&maxResults=1';
  
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.items && json.items[0] && json.items[0].volumeInfo && json.items[0].volumeInfo.imageLinks) {
            let imgUrl = json.items[0].volumeInfo.imageLinks.thumbnail || json.items[0].volumeInfo.imageLinks.smallThumbnail;
            if (imgUrl) {
              imgUrl = imgUrl.replace('http:', 'https:').replace('&edge=curl', '');
              resolve(imgUrl);
            } else {
              resolve(null);
            }
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function run() {
  const newBooks = [];
  for (const book of books) {
    const coverUrl = await fetchCoverUrl(book.title, book.author);
    book.coverImage = coverUrl || ('https://covers.openlibrary.org/b/title/' + encodeURIComponent(book.title) + '-L.jpg');
    newBooks.push(book);
    await new Promise(r => setTimeout(r, 200)); 
  }
  
  const fileContent = 'export const curatedRecommendedBooks = ' + JSON.stringify(newBooks, null, 2) + ';\n';
  fs.writeFileSync('src/data/curatedBooks.js', fileContent);
  console.log('Successfully updated src/data/curatedBooks.js');
}

run();
