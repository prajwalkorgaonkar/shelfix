const fs = require('fs');
const crypto = require('crypto');

const branches = {
  'computer-science': {
    subjects: ['DBMS', 'DSA', 'AI', 'Networking', 'Web Development', 'Operating Systems', 'Cybersecurity'],
    prefixes: ['Introduction to', 'Advanced', 'Principles of', 'Modern', 'Fundamentals of', 'Applied', 'The Art of'],
    cores: ['Algorithms', 'Data Structures', 'Machine Learning', 'Computer Networks', 'Software Engineering', 'Database Systems', 'Cloud Computing', 'Cybersecurity', 'Operating Systems', 'Artificial Intelligence', 'Web Technologies'],
    suffixes: ['in Practice', 'for Professionals', 'and Design', 'A Comprehensive Guide', 'Concepts and Techniques', 'Foundations'],
    authors: ['Robert Sedgewick', 'Alan Turing', 'Ada Lovelace', 'Donald Knuth', 'Tim Berners-Lee', 'Grace Hopper', 'Linus Torvalds', 'Bjarne Stroustrup', 'James Gosling', 'Guido van Rossum']
  },
  'mechanical': {
    subjects: ['Thermodynamics', 'Fluid Mechanics', 'Machine Design', 'Robotics', 'Kinematics', 'Heat Transfer'],
    prefixes: ['Engineering', 'Applied', 'Fundamentals of', 'Advanced', 'Modern', 'Principles of'],
    cores: ['Thermodynamics', 'Fluid Mechanics', 'Machine Elements', 'Heat and Mass Transfer', 'Robotics and Control', 'Manufacturing Processes', 'Solid Mechanics', 'Dynamics of Machinery'],
    suffixes: ['for Engineers', 'and Design', 'A Practical Approach', 'Principles', 'and Applications'],
    authors: ['Nikola Tesla', 'James Watt', 'Henry Ford', 'Rudolf Diesel', 'George Stephenson', 'Osborne Reynolds', 'William Rankine']
  },
  'civil': {
    subjects: ['Structural Analysis', 'Soil Mechanics', 'Surveying', 'Transportation', 'Environmental'],
    prefixes: ['Principles of', 'Advanced', 'Fundamentals of', 'Modern', 'Design of', 'Introduction to'],
    cores: ['Structural Engineering', 'Geotechnical Engineering', 'Transportation Systems', 'Environmental Engineering', 'Concrete Structures', 'Steel Structures', 'Surveying and Leveling', 'Hydraulics'],
    suffixes: ['in Civil Engineering', 'for Infrastructure', 'A Comprehensive Guide', 'and Practice', 'Design Codes'],
    authors: ['Karl Terzaghi', 'Isambard Kingdom Brunel', 'John Smeaton', 'Gustave Eiffel', 'Othmar Ammann', 'Fazlur Rahman Khan']
  },
  'electrical': {
    subjects: ['Power Systems', 'Digital Electronics', 'Control Systems', 'Signal Processing', 'Microprocessors'],
    prefixes: ['Introduction to', 'Modern', 'Advanced', 'Fundamentals of', 'Principles of', 'Applied'],
    cores: ['Circuit Analysis', 'Power Electronics', 'Electromagnetic Theory', 'Digital Logic Design', 'Microprocessors', 'Signals and Systems', 'Control Systems', 'Electrical Machines'],
    suffixes: ['and Applications', 'for Engineers', 'A Practical Guide', 'Design', 'and Analysis'],
    authors: ['Michael Faraday', 'Thomas Edison', 'Guglielmo Marconi', 'Heinrich Hertz', 'James Clerk Maxwell', 'Oliver Heaviside']
  },
  'mathematics': {
    subjects: ['Calculus', 'Linear Algebra', 'Probability', 'Discrete Math', 'Differential Equations'],
    prefixes: ['Introduction to', 'Advanced', 'Applied', 'Elements of', 'Fundamentals of', 'Modern'],
    cores: ['Calculus', 'Linear Algebra', 'Probability Theory', 'Differential Equations', 'Discrete Mathematics', 'Real Analysis', 'Complex Variables', 'Topology', 'Number Theory'],
    suffixes: ['and Applications', 'for Sciences', 'A First Course', 'with Applications', 'and Practice'],
    authors: ['Isaac Newton', 'Leonhard Euler', 'Carl Friedrich Gauss', 'Bernhard Riemann', 'Henri Poincaré', 'David Hilbert', 'John von Neumann']
  },
  'science': {
    subjects: ['Physics', 'Chemistry', 'Nanotechnology', 'Biology', 'Material Science'],
    prefixes: ['Principles of', 'Modern', 'Introduction to', 'Advanced', 'Fundamentals of'],
    cores: ['Quantum Mechanics', 'Organic Chemistry', 'Nanotechnology', 'Molecular Biology', 'Materials Science', 'Astrophysics', 'Genetics', 'Physical Chemistry'],
    suffixes: ['and the Universe', 'for Scientists', 'A Modern Approach', 'in Practice', 'Concepts'],
    authors: ['Albert Einstein', 'Marie Curie', 'Richard Feynman', 'Niels Bohr', 'Erwin Schrödinger', 'Rosalind Franklin', 'Stephen Hawking']
  },
  'fiction': {
    subjects: ['Sci-Fi', 'Classic Literature', 'Fantasy', 'Mystery', 'Historical Fiction'],
    prefixes: ['The Secret of', 'Echoes of', 'Shadows in', 'The Last', 'A Tale of', 'Chronicles of', 'Journey to'],
    cores: ['Time', 'the Stars', 'the Forgotten City', 'the Dragon', 'the Abyss', 'the Empire', 'the Silent Woods'],
    suffixes: ['and Beyond', '', 'Part I', 'The Beginning', '', 'Redux'],
    authors: ['Jane Austen', 'Charles Dickens', 'J.R.R. Tolkien', 'Arthur Conan Doyle', 'Agatha Christie', 'H.G. Wells', 'Isaac Asimov', 'George Orwell', 'Virginia Woolf']
  },
  'philosophy': {
    subjects: ['Stoicism', 'Existentialism', 'Ethics', 'Epistemology', 'Logic'],
    prefixes: ['The Philosophy of', 'Introduction to', 'Essays on', 'Critique of', 'Meditations on', 'The Nature of'],
    cores: ['Pure Reason', 'Morality', 'Human Understanding', 'Existentialism', 'Stoicism', 'Logic and Truth', 'Being and Time', 'Political Thought'],
    suffixes: ['in the Modern Age', '', 'A New Perspective', '', 'and Society'],
    authors: ['Plato', 'Aristotle', 'Immanuel Kant', 'Friedrich Nietzsche', 'John Locke', 'Rene Descartes', 'David Hume', 'Jean-Paul Sartre', 'Socrates']
  },
  'psychology': {
    subjects: ['Behavioral Psychology', 'Cognitive Science', 'Clinical Psychology', 'Neuropsychology'],
    prefixes: ['Introduction to', 'The Psychology of', 'Understanding', 'Principles of', 'Advanced', 'Modern'],
    cores: ['Human Behavior', 'Cognitive Processes', 'Abnormal Psychology', 'Neuroscience', 'Social Psychology', 'Developmental Psychology', 'Personality Theories'],
    suffixes: ['and Applications', 'in Practice', 'A Comprehensive Guide', 'and the Mind', ''],
    authors: ['Sigmund Freud', 'Carl Jung', 'B.F. Skinner', 'Jean Piaget', 'Ivan Pavlov', 'William James', 'Lev Vygotsky', 'John B. Watson']
  },
  'business-finance': {
    subjects: ['Investing', 'Entrepreneurship', 'Corporate Strategy', 'Personal Finance', 'Marketing', 'Leadership'],
    prefixes: ['The Art of', 'Principles of', 'Modern', 'Introduction to', 'Strategic', 'Advanced'],
    cores: ['Corporate Finance', 'Investment Analysis', 'Marketing Strategy', 'Organizational Behavior', 'Financial Accounting', 'Business Ethics', 'Microeconomics'],
    suffixes: ['for Managers', 'and Practice', 'in the Global Economy', 'A Practical Guide', 'and Planning'],
    authors: ['Adam Smith', 'John Maynard Keynes', 'Peter Drucker', 'Warren Buffett', 'Milton Friedman', 'Benjamin Graham', 'Philip Kotler']
  },
  'self-development': {
    subjects: ['Productivity', 'Habit Building', 'Mindset', 'Communication', 'Time Management'],
    prefixes: ['The Power of', 'Mastering', 'The Art of', 'Effective', 'Strategies for', 'Unlocking'],
    cores: ['Habits', 'Focus', 'Communication', 'Time Management', 'Leadership', 'Emotional Intelligence', 'Mindfulness', 'Personal Growth'],
    suffixes: ['in Daily Life', 'for Success', 'A Practical Guide', 'and Happiness', 'in the Modern World'],
    authors: ['Dale Carnegie', 'Stephen Covey', 'Napoleon Hill', 'Tony Robbins', 'Brian Tracy', 'Jim Rohn', 'Eckhart Tolle', 'Robin Sharma']
  }
};

const tagsPool = ['Bestseller', 'Trending', 'Faculty Recommended', 'New Arrival', 'Classic', 'Most Borrowed'];

const imgIds = [
  "1550439062-609e1531270e", "1518770660439-4636190af475", "1542831371-29b0f74f9713", "1558494949-ef010cbdcc31",
  "1517694712202-14dd9538aa97", "1555066931-4365d14bab8c", "1522542550221-31fd19575a2d", "1451187580459-43490279c0fa",
  "1526374965328-7f61d4dc18c5", "1509228468518-180dd4864904", "1537462715879-360eeb61a0ad", "1504917595217-d4dc5ebe6122",
  "1581092795360-fd1ca04f0952", "1581092580497-e0d23cbdf1dc", "1492144534655-ae79c964c9d7", "1503387762-592deb58ef4e",
  "1590422749909-0d17d591bd2c", "1485827404703-89b55fcc595e", "1581091226825-a6a2a5aee158", "1504328345606-18bbc8c9d7d1",
  "1589828497678-7711d9a26368", "1589939705384-5185137a7f0f", "1473448912268-2022ce9509d8", "1541888081622-19e42108ec73",
  "1464938050520-ef2270bb8ce8", "1465447142348-e9952c393450", "1517077304055-6e89aadf09f0", "1473341304170-971dccb5ac1e",
  "1580894732444-8ecded7900cd", "1551288049-bebda4e38f71", "1581092160562-40aa08e78837", "1558346490-a72e53ae874e",
  "1555664424-778a1e5e1b48", "1635070041078-e363dbe005cb", "1596495578065-6e0763fa1178", "1518133910546-b6c2fb7d79e3",
  "1636466497217-26a8cbeaf0aa", "1530213786676-415b0d4749cc", "1603126857599-f6e157825828", "1605806616949-1e87b487cb2a",
  "1589829085413-56de8ae18c73", "1544947950-fa07a98d237f", "1572949645841-094f3a9c4c94", "1456513080510-7bf3a84b82f8",
  "1544716278-e513176f20b5", "1551836022-d5d88e9218df", "1579621970563-ebec7560ff3e", "1512314889357-e157c22f938d",
  "1553484771-047a44eee2cb", "1507679799987-c73779587ccf", "1611016186353-9af58c69a533", "1499750310107-5fef28a66643"
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const newBooks = [];
for (const [branchId, config] of Object.entries(branches)) {
  for (let i = 0; i < 50; i++) { 
    const title = `${getRandom(config.prefixes)} ${getRandom(config.cores)} ${getRandom(config.suffixes)}`.trim().replace(/ +/g, ' ');
    
    const numTags = Math.floor(Math.random() * 3);
    const tags = [];
    const poolCopy = [...tagsPool];
    for (let t = 0; t < numTags; t++) {
      const idx = Math.floor(Math.random() * poolCopy.length);
      tags.push(poolCopy[idx]);
      poolCopy.splice(idx, 1);
    }

    const rating = (3.5 + Math.random() * 1.5).toFixed(1);
    const availableCopies = Math.floor(Math.random() * 15);
    const year = 1970 + Math.floor(Math.random() * 54);
    
    const coverImage = `https://images.unsplash.com/photo-${getRandom(imgIds)}?auto=format&fit=crop&q=80&w=400`;
    
    newBooks.push({
      id: `${branchId}_new_${crypto.randomBytes(4).toString('hex')}`,
      title,
      author: getRandom(config.authors),
      branch: branchId,
      subject: getRandom(config.subjects),
      rating: parseFloat(rating),
      availableCopies,
      rackNumber: `${branchId.substring(0, 2).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      coverImage,
      tags,
      year,
      desc: `A comprehensive resource exploring the concepts of ${title.toLowerCase()}. Ideal for students and professionals alike.`
    });
  }
}

const content = fs.readFileSync('client/src/data/mockData.js', 'utf8');

let booksStrList = [];
for (let book of newBooks) {
  let str = JSON.stringify(book);
  booksStrList.push(str);
}
const newBooksStr = ',\n  ' + booksStrList.join(',\n  ') + '\n';

const lastIdx = content.lastIndexOf('];');
if (lastIdx !== -1) {
  const finalContent = content.substring(0, lastIdx) + newBooksStr + '];\n';
  fs.writeFileSync('client/src/data/mockData.js', finalContent, 'utf8');
  console.log(`Successfully appended ${newBooks.length} new books!`);
} else {
  console.log("Could not find ]; to append to");
}
