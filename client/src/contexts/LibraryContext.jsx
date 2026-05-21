import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockBooks, branchConfig } from '../data/mockData';
import { Check, AlertCircle, X } from 'lucide-react';
import { useAuth } from './AuthContext';

const LibraryContext = createContext();

export const useLibrary = () => useContext(LibraryContext);

const debugStorage = (action, key, data) => {
  console.log(`[LIBRARY DEBUG] ${action} ${key}:`, data);
};

export const LibraryProvider = ({ children }) => {
  const { user } = useAuth();
  
  const getLibraryState = () => {
    try {
      const stored = localStorage.getItem('shelfix_library_state');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.users) parsed.users = {};
        if (!parsed.books) parsed.books = mockBooks;
        return parsed;
      }
    } catch(e) {
      console.error("[LIBRARY DEBUG] Error parsing shelfix_library_state", e);
    }
    return { books: mockBooks, users: {} };
  };

  const saveLibraryState = (newState) => {
    localStorage.setItem('shelfix_library_state', JSON.stringify(newState));
    debugStorage("WRITE", "shelfix_library_state", newState);
  };

  const [books, setBooks] = useState(() => {
    console.log("[LIBRARY DEBUG] Initializing books state...");
    const state = getLibraryState();
    debugStorage("READ", "shelfix_library_state (books init)", state);
    
    const existingIds = new Set(state.books.map(b => b.id));
    const newBooks = mockBooks.filter(b => !existingIds.has(b.id));
    if (newBooks.length > 0) {
      console.log(`[LIBRARY DEBUG] Adding ${newBooks.length} new mock books to state.`);
      const mergedBooks = [...state.books, ...newBooks];
      state.books = mergedBooks;
      saveLibraryState(state);
      return mergedBooks;
    }
    return state.books;
  });
  
  const [borrowedBooks, setBorrowedBooks] = useState(() => {
    if (user) {
      const state = getLibraryState();
      return state.users[user.id]?.borrowedBooks || [];
    }
    return [];
  });

  const [returnHistory, setReturnHistory] = useState(() => {
    if (user) {
      const state = getLibraryState();
      return state.users[user.id]?.returnHistory || [];
    }
    return [];
  });
  
  const [toast, setToast] = useState(null);

  // Load user-specific library data when user changes (e.g. login/logout)
  useEffect(() => {
    console.log("[LIBRARY DEBUG] Auth user changed:", user ? user.username : "null");
    if (user) {
      const state = getLibraryState();
      const userState = state.users[user.id] || { borrowedBooks: [], returnHistory: [] };
      setBorrowedBooks(userState.borrowedBooks || []);
      setReturnHistory(userState.returnHistory || []);
    } else {
      console.log("[LIBRARY DEBUG] Resetting local library state due to logout");
      setBorrowedBooks([]);
      setReturnHistory([]);
    }
  }, [user]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const borrowBook = (book, borrowData = {}) => {
    console.log(`[LIBRARY DEBUG] Action: borrowBook for ${book.title}`);
    if (!user) {
      showToast('You must be logged in to borrow a book', 'error');
      return false;
    }

    if (borrowedBooks.length >= 5) {
      showToast('Maximum borrow limit reached (5 books)', 'error');
      return false;
    }

    if (borrowedBooks.some(b => b.bookId === book.id)) {
      showToast('You have already borrowed this book', 'error');
      return false;
    }

    const currentBook = books.find(b => b.id === book.id) || book;
    if (currentBook.availableCopies <= 0) {
      showToast('Book is currently out of stock', 'error');
      return false;
    }

    const borrowDate = borrowData.borrowDate ? new Date(borrowData.borrowDate) : new Date();
    const dueDate = borrowData.returnDate ? new Date(borrowData.returnDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const newBorrow = {
      borrowId: `brw_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      bookId: book.id,
      title: currentBook.title,
      author: currentBook.author,
      coverImage: currentBook.coverImage,
      branch: currentBook.branch,
      borrowDate: borrowDate.toISOString(),
      dueDate: dueDate.toISOString(),
      notes: borrowData.notes || ''
    };

    const updatedBooks = books.map(b => 
      b.id === book.id ? { ...b, availableCopies: b.availableCopies - 1 } : b
    );
    const updatedBorrowed = [...borrowedBooks, newBorrow];

    setBooks(updatedBooks);
    setBorrowedBooks(updatedBorrowed);

    // Synchronous Save to Persistence
    const state = getLibraryState();
    state.books = updatedBooks;
    if (!state.users[user.id]) state.users[user.id] = { borrowedBooks: [], returnHistory: [] };
    state.users[user.id].borrowedBooks = updatedBorrowed;
    state.users[user.id].returnHistory = returnHistory;
    saveLibraryState(state);

    showToast(`Successfully borrowed "${currentBook.title}"`);
    return true;
  };

  const returnBook = (borrowId) => {
    console.log(`[LIBRARY DEBUG] Action: returnBook for ID ${borrowId}`);
    if (!user) return;
    
    const record = borrowedBooks.find(b => b.borrowId === borrowId);
    if (!record) return;

    const updatedBorrowed = borrowedBooks.filter(b => b.borrowId !== borrowId);
    const updatedHistory = [...returnHistory, { ...record, returnDate: new Date().toISOString() }];
    const updatedBooks = books.map(b => 
      b.id === record.bookId ? { ...b, availableCopies: b.availableCopies + 1 } : b
    );
    
    setBorrowedBooks(updatedBorrowed);
    setReturnHistory(updatedHistory);
    setBooks(updatedBooks);

    // Synchronous Save to Persistence
    const state = getLibraryState();
    state.books = updatedBooks;
    if (!state.users[user.id]) state.users[user.id] = { borrowedBooks: [], returnHistory: [] };
    state.users[user.id].borrowedBooks = updatedBorrowed;
    state.users[user.id].returnHistory = updatedHistory;
    saveLibraryState(state);

    showToast(`Returned "${record.title}"`);
  };

  return (
    <LibraryContext.Provider value={{ books, borrowedBooks, returnHistory, borrowBook, returnBook, triggerToast: showToast }}>
      {children}
      
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md ${
            toast.type === 'error' 
              ? 'bg-red-50/90 dark:bg-red-900/30 border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400'
              : 'bg-emerald-50/90 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400'
          }`}>
            {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
            <span className="text-sm font-semibold">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </LibraryContext.Provider>
  );
};
