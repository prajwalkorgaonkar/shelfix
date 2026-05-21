import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Book, Users, BookOpen, Clock, Search, History, ArrowRight } from 'lucide-react';
import { useLibrary } from '../contexts/LibraryContext';
import BorrowModal from '../components/BorrowModal';
import { curatedRecommendedBooks } from '../data/curatedBooks';


const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white dark:bg-darkCard rounded-[20px] p-5 h-[140px] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-center gap-3 hover:-translate-y-1 transition-all duration-300 hover:shadow-md cursor-default w-full min-w-0">
    <div className="flex items-center gap-3 mb-2">
      <div className={`p-2.5 rounded-xl ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold tracking-wide uppercase text-xs">{title}</p>
    </div>
    <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</h3>
  </div>
);

const RecommendedBookCard = ({ book, onBorrowRequest, isBorrowed }) => {
  const isAvailable = book.availableCopies > 0;
  return (
    <div className="w-full h-full bg-white dark:bg-darkCard border border-gray-100 dark:border-gray-800/60 rounded-[24px] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 hover:border-primary/50 transition-all duration-500 group relative flex flex-col cursor-pointer">
      <div className="w-full shrink-0 h-64 overflow-hidden relative flex justify-center items-center bg-gray-100 dark:bg-slate-800">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500 z-10" />
        
        {book.coverImage ? (
          <img 
            src={book.coverImage} 
            alt={book.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              if (e.currentTarget.src.includes('fallback-book-cover.jpg')) return;
              e.currentTarget.src = '/fallback-book-cover.jpg';
            }}
          />
        ) : (
          <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600" />
        )}
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 z-20">
          <span className="bg-white/90 dark:bg-black/70 backdrop-blur-md text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm text-gray-800 dark:text-gray-200 border border-white/20 uppercase tracking-wider">
            {book.category || book.subject}
          </span>
        </div>
        <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1.5">
          <div className={`backdrop-blur-md text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-white/20 ${isAvailable ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
            {isAvailable ? `${book.availableCopies} Copies` : 'Waitlist'}
          </div>
          <div className="bg-black/70 backdrop-blur-md text-[10px] font-bold px-2 py-1 rounded-full text-yellow-400 flex items-center gap-1 border border-white/10 shadow-sm">
            ★ {book.rating}
          </div>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-1 relative bg-white dark:bg-darkCard">
        {/* Subtle top glow on hover */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <h4 className="font-bold text-base text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors duration-300" title={book.title}>{book.title}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 mb-4 line-clamp-1" title={book.author}>{book.author}</p>
        
        <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800/60">
          <button 
            onClick={() => isAvailable && !isBorrowed && onBorrowRequest(book)}
            disabled={!isAvailable || isBorrowed}
            className={`w-full py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              isBorrowed 
                ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 cursor-default'
                : isAvailable 
                  ? 'bg-primary/10 text-primary hover:bg-primary hover:text-white dark:hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]' 
                  : 'bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-slate-800 dark:text-gray-400'
            }`}
          >
            {isBorrowed ? 'Borrowed' : isAvailable ? 'Borrow Book' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const { books, borrowedBooks, returnBook, borrowBook, triggerToast } = useLibrary();
  const [selectedBookToBorrow, setSelectedBookToBorrow] = useState(null);
  
  const recommendedBooks = React.useMemo(() => {
    return curatedRecommendedBooks.map(book => {
      // Find if this book was somehow added to global state
      const globalBook = books.find(b => b.id === book.id);
      if (globalBook) return globalBook;
      
      // Compute available copies dynamically based on current user's borrowed state
      const isBorrowedByMe = borrowedBooks.some(b => b.bookId === book.id);
      return {
        ...book,
        availableCopies: isBorrowedByMe ? Math.max(0, book.availableCopies - 1) : book.availableCopies
      };
    }).slice(0, 30);
  }, [books, borrowedBooks]);
  const [stats, setStats] = useState({ totalBooks: 0, activeBorrows: 0, totalUsers: 0, overdue: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef(null);

  // Close search suggestions if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  const filteredRecommendedBooks = recommendedBooks.filter(book => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const category = book.category || book.subject;
    return (
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      (category && category.toLowerCase().includes(query))
    );
  });

  const recentSearches = ['Artificial Intelligence', 'Physics Fundamentals', 'Data Structures'];

  useEffect(() => {
    const total = books.length;
    const borrows = borrowedBooks.length;
    const userOverdue = borrowedBooks.filter(b => new Date(b.dueDate) < new Date()).length;
    setStats({
      totalBooks: total,
      activeBorrows: borrows,
      totalUsers: 342,
      overdue: userOverdue
    });
  }, [books, borrowedBooks]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full min-w-0">
      
      {/* Welcome & Search Section */}
      <div className="flex flex-col gap-6 bg-white dark:bg-darkCard p-6 lg:p-8 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden w-full min-w-0">
        
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Welcome back, {user?.username} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-base mt-1.5">
            What would you like to learn today?
          </p>
        </div>
        
        <div className="relative w-full max-w-2xl z-10" ref={searchRef}>
          <div className={`relative flex items-center transition-all duration-300 rounded-[20px] bg-white dark:bg-slate-900 border ${isSearchFocused ? 'border-primary ring-4 ring-primary/10 shadow-lg shadow-primary/5' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm'}`}>
            <Search className={`absolute left-4 w-5 h-5 transition-colors duration-300 ${isSearchFocused ? 'text-primary' : 'text-gray-400'}`} />
            <input 
              type="text" 
              placeholder="Search books, authors, subjects..."
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-transparent outline-none transition-all dark:text-white text-sm"
            />
          </div>

          {/* Search Dropdown / Live Suggestions */}
          {isSearchFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-darkCard border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              {searchQuery ? (
                <div className="p-2">
                  <p className="text-xs font-semibold text-gray-400 px-3 py-2 uppercase tracking-wider">Suggestions</p>
                  <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer flex items-center gap-3">
                    <Search className="w-4 h-4 text-gray-400" />
                    <span>Search for <span className="font-semibold">"{searchQuery}"</span></span>
                  </div>
                </div>
              ) : (
                <div className="p-2">
                  <p className="text-xs font-semibold text-gray-400 px-3 py-2 uppercase tracking-wider">Recent Searches</p>
                  {recentSearches.map((term, i) => (
                    <div key={i} className="px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer flex items-center gap-3 transition-colors">
                      <History className="w-4 h-4 text-gray-400" />
                      {term}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          title="Total Books" 
          value={stats.totalBooks} 
          icon={Book} 
          colorClass="bg-blue-50 dark:bg-blue-900/20 text-blue-500" 
        />
        <StatCard 
          title="Active Borrows" 
          value={stats.activeBorrows} 
          icon={BookOpen} 
          colorClass="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500" 
        />
        {user?.role === 'Admin' ? (
          <StatCard 
            title="Total Users" 
            value={stats.totalUsers} 
            icon={Users} 
            colorClass="bg-purple-50 dark:bg-purple-900/20 text-purple-500" 
          />
        ) : (
          <StatCard 
            title="My Borrows" 
            value={borrowedBooks.length.toString()} 
            icon={BookOpen} 
            colorClass="bg-purple-50 dark:bg-purple-900/20 text-purple-500" 
          />
        )}
        <StatCard 
          title="Overdue Books" 
          value={stats.overdue} 
          icon={Clock} 
          colorClass="bg-red-50 dark:bg-red-900/20 text-red-500" 
        />
      </div>

      {/* Recommended Books Section & Quick Links */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 w-full min-w-0">
        <div className="xl:col-span-2 bg-white dark:bg-darkCard rounded-[24px] border border-gray-100 dark:border-gray-800 p-6 shadow-sm w-full min-w-0 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              {user?.role === 'Admin' ? 'Top Borrowed Books' : 'Recommended for You'}
            </h2>
            <button className="text-sm font-medium text-primary hover:text-blue-600 transition-colors flex items-center gap-1 group">
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 2xl:grid-cols-6 gap-4 sm:gap-6 mt-4 pb-4 h-[600px] overflow-y-auto custom-scrollbar pr-2 auto-rows-max">
            {filteredRecommendedBooks.length > 0 ? (
              filteredRecommendedBooks.map((book) => (
                <RecommendedBookCard 
                  key={book.id}
                  book={book} 
                  onBorrowRequest={setSelectedBookToBorrow}
                  isBorrowed={borrowedBooks.some(b => b.bookId === book.id)}
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No results found</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">We couldn't find any books matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-darkCard rounded-[24px] border border-gray-100 dark:border-gray-800 p-6 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">My Borrowed Books</h2>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">{borrowedBooks.length} / 5</span>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {borrowedBooks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center pb-8">
                <BookOpen className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">You haven't borrowed any books yet.</p>
              </div>
            ) : (
              borrowedBooks.map((borrow) => {
                const dueDate = new Date(borrow.dueDate);
                const isOverdue = dueDate < new Date();
                const daysLeft = Math.max(0, Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24)));
                
                return (
                  <div key={borrow.borrowId} className="flex gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700/60 bg-gray-50/50 dark:bg-slate-800/30 hover:border-primary/30 transition-colors group">
                    <img src={borrow.coverImage} alt={borrow.title} className="w-12 h-16 object-cover rounded-md shadow-sm shrink-0" />
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1 group-hover:text-primary transition-colors">{borrow.title}</h4>
                      <div className="flex flex-col gap-0.5 mt-1">
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Borrowed: {new Date(borrow.borrowDate).toLocaleDateString()}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Due: {new Date(borrow.dueDate).toLocaleDateString()}</p>
                      </div>
                      
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <Clock className={`w-3 h-3 ${isOverdue ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`} />
                          <span className={`text-[10px] font-bold tracking-wide uppercase ${isOverdue ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                            {isOverdue ? 'Overdue!' : `${daysLeft} days left`}
                          </span>
                        </div>
                        <button 
                          onClick={() => returnBook(borrow.borrowId)}
                          className="text-[10px] font-bold text-white bg-primary hover:bg-blue-600 px-2.5 py-1.5 rounded-md shadow-sm transition-colors"
                        >
                          Return
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      <BorrowModal 
        book={selectedBookToBorrow} 
        onClose={() => setSelectedBookToBorrow(null)} 
        onConfirm={borrowBook} 
      />
    </div>
  );
};

export default Dashboard;
