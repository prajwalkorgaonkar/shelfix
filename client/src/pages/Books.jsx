import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, BookOpen, Star, ChevronDown, Check, X, SlidersHorizontal, BookMarked, Users, Book, Flame } from 'lucide-react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { branchConfig } from '../data/mockData';
import { useLibrary } from '../contexts/LibraryContext';
import BorrowModal from '../components/BorrowModal';

const SkeletonBookCard = () => (
  <div className="bg-white dark:bg-darkCard border border-gray-100 dark:border-gray-800/60 rounded-[24px] overflow-hidden shadow-sm h-full flex flex-col animate-pulse">
    <div className="h-56 bg-gray-200 dark:bg-slate-700 w-full" />
    <div className="p-5 flex flex-col flex-1">
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-3" />
      <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-5" />
      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800/60">
        <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded-xl w-full" />
      </div>
    </div>
  </div>
);

const BookCard = ({ book, onBorrowRequest, isBorrowed }) => {
  const isAvailable = book.availableCopies > 0;
  return (
    <div className="bg-white dark:bg-darkCard border border-gray-100 dark:border-gray-800/60 rounded-[24px] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 hover:border-primary/50 transition-all duration-500 group relative flex flex-col h-full cursor-pointer">
      <div className="h-56 bg-gray-100 dark:bg-slate-800 relative overflow-hidden flex justify-center items-center">
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500 z-10" />
        
        {book.coverImage ? (
          <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
        ) : (
          <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 transition-transform duration-700 group-hover:scale-110" />
        )}
        
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
          {book.tags?.map(tag => (
            <span key={tag} className={`backdrop-blur-md text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm border uppercase tracking-wider flex items-center gap-1 ${
              tag === 'Trending' ? 'bg-orange-500/90 text-white border-white/20' : 
              tag === 'Bestseller' ? 'bg-purple-500/90 text-white border-white/20' : 
              'bg-white/90 dark:bg-black/70 text-gray-800 dark:text-gray-200 border-white/20'
            }`}>
              {tag === 'Trending' && <Flame className="w-3 h-3" />}
              {tag}
            </span>
          ))}
          {!book.tags?.length && (
            <span className="bg-white/90 dark:bg-black/70 backdrop-blur-md text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm text-gray-800 dark:text-gray-200 border border-white/20 uppercase tracking-wider">
              {book.subject}
            </span>
          )}
        </div>
        
        <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1.5">
          <div className={`backdrop-blur-md text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-white/20 ${isAvailable ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
            {isAvailable ? `${book.availableCopies} Copies Available` : 'Waitlist'}
          </div>
          <div className="bg-black/70 backdrop-blur-md text-[10px] font-bold px-2 py-1 rounded-full text-yellow-400 flex items-center gap-1 border border-white/10 shadow-sm">
            ★ {book.rating}
          </div>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-1 relative bg-white dark:bg-darkCard">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <h4 className="font-bold text-base text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors duration-300">{book.title}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 mb-2 line-clamp-1">{book.author}</p>
        
        <div className="flex items-center gap-2 mb-4 mt-auto">
           <span className="text-xs text-gray-400 dark:text-gray-500 font-medium bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">Rack: {book.rackNumber}</span>
        </div>
        
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800/60">
          <button 
            onClick={() => isAvailable && !isBorrowed && onBorrowRequest(book)}
            disabled={!isAvailable || isBorrowed}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              isBorrowed 
                ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 cursor-default'
                : isAvailable 
                  ? 'bg-primary/10 text-primary hover:bg-primary hover:text-white dark:hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]' 
                  : 'bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-slate-800 dark:text-gray-400'
            }`}
          >
            {isBorrowed ? 'Borrowed by You' : isAvailable ? 'Borrow Book' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

const BranchHero = ({ branchInfo, books = [], borrowedBooks = [] }) => {
  if (!branchInfo || branchInfo.id === 'all') return null;
  
  const branchBooks = books.filter(b => b.branch === branchInfo.id);
  const totalBooks = branchBooks.length;
  const activeBorrows = borrowedBooks.filter(b => b.branch === branchInfo.id).length;
  
  return (
    <div className="bg-white dark:bg-darkCard rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden relative mb-8">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      
      <div className="p-6 md:p-8 relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{branchInfo.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-base max-w-2xl">{branchInfo.description}</p>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mr-2 self-center">Trending:</span>
            {branchInfo.trendingSubjects?.map(sub => (
              <span key={sub} className="px-3 py-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700">
                {sub}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex gap-4 md:gap-8 bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shrink-0 w-full md:w-auto">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase mb-1">Total Books</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-primary" /> {totalBooks}
            </p>
          </div>
          <div className="w-px bg-gray-200 dark:bg-gray-700" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase mb-1">Active Borrows</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" /> {activeBorrows}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Books = () => {
  const { branchId = 'all' } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { books, borrowedBooks, borrowBook } = useLibrary();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedBookToBorrow, setSelectedBookToBorrow] = useState(null);
  const ITEMS_PER_PAGE = 8;
  
  // Filter state
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || 'all');
  const [availableOnly, setAvailableOnly] = useState(searchParams.get('available') === 'true');
  const [minRating, setMinRating] = useState(Number(searchParams.get('rating')) || 0);

  // Sync state with URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedSubject !== 'all') params.set('subject', selectedSubject);
    if (availableOnly) params.set('available', 'true');
    if (minRating > 0) params.set('rating', minRating.toString());
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedSubject, availableOnly, minRating, setSearchParams]);

  const currentBranchInfo = branchConfig[branchId] || branchConfig['all'];

  // Simulate loading data
  useEffect(() => {
    setIsLoading(true);
    setPage(1);
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, [branchId, selectedSubject, availableOnly, minRating, searchQuery]);

  // Derived data
  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchBranch = branchId === 'all' || book.branch === branchId;
      const matchSubject = selectedSubject === 'all' || book.subject === selectedSubject;
      const matchSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchAvailability = availableOnly ? book.availableCopies > 0 : true;
      const matchRating = book.rating >= minRating;
      
      return matchBranch && matchSubject && matchSearch && matchAvailability && matchRating;
    });
  }, [branchId, selectedSubject, searchQuery, availableOnly, minRating]);

  const displayedBooks = filteredBooks.slice(0, page * ITEMS_PER_PAGE);
  const hasMore = displayedBooks.length < filteredBooks.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Library Catalog</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Browse and borrow books across all departments.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search books, authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-darkCard border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm dark:text-white transition-all shadow-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button 
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className={`md:hidden p-2.5 border rounded-xl transition-colors shadow-sm ${
              showMobileFilters || availableOnly || minRating > 0 || selectedSubject !== 'all' 
                ? 'bg-primary border-primary text-white' 
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-gray-600 dark:text-gray-300'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Branch Navigation Pills */}
      <div className="flex overflow-x-auto pb-2 scrollbar-hide gap-2 -mx-2 px-2 snap-x">
        {Object.values(branchConfig).map(branch => (
          <button
            key={branch.id}
            onClick={() => {
              setSelectedSubject('all');
              navigate(`/books/${branch.id}`);
            }}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all snap-start ${
              branchId === branch.id 
                ? 'bg-primary text-white shadow-md shadow-primary/20' 
                : 'bg-white dark:bg-darkCard border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 shadow-sm hover:border-gray-300'
            }`}
          >
            {branch.name}
          </button>
        ))}
      </div>

      <BranchHero branchInfo={currentBranchInfo} books={books} borrowedBooks={borrowedBooks} />

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Filters Sidebar */}
        <div className={`md:w-64 shrink-0 space-y-6 ${showMobileFilters ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white dark:bg-darkCard rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm p-5 sticky top-24">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filters
              </h3>
              {(selectedSubject !== 'all' || availableOnly || minRating > 0) && (
                <button 
                  onClick={() => { setSelectedSubject('all'); setAvailableOnly(false); setMinRating(0); }}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Subjects Filter */}
            {currentBranchInfo.subjects && currentBranchInfo.subjects.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Subject</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="subject" checked={selectedSubject === 'all'} onChange={() => setSelectedSubject('all')} className="hidden" />
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${selectedSubject === 'all' ? 'border-primary bg-primary' : 'border-gray-300 dark:border-gray-600 group-hover:border-primary'}`}>
                      {selectedSubject === 'all' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <span className={`text-sm flex-1 flex justify-between items-center ${selectedSubject === 'all' ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                      <span>All Subjects</span>
                      <span className="text-xs bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-gray-500">
                        {books.filter(b => branchId === 'all' || b.branch === branchId).length}
                      </span>
                    </span>
                  </label>
                  
                  {currentBranchInfo.subjects.map(sub => {
                    const count = books.filter(b => (branchId === 'all' || b.branch === branchId) && b.subject === sub).length;
                    return (
                      <label key={sub} className="flex items-center gap-3 cursor-pointer group">
                        <input type="radio" name="subject" checked={selectedSubject === sub} onChange={() => setSelectedSubject(sub)} className="hidden" />
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${selectedSubject === sub ? 'border-primary bg-primary' : 'border-gray-300 dark:border-gray-600 group-hover:border-primary'}`}>
                          {selectedSubject === sub && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <span className={`text-sm flex-1 flex justify-between items-center ${selectedSubject === sub ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                          <span>{sub}</span>
                          <span className="text-xs bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-gray-500">
                            {count}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Availability */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Availability</h4>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} className="hidden" />
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${availableOnly ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600 group-hover:border-primary'}`}>
                  {availableOnly && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Available Now</span>
              </label>
            </div>

            {/* Rating */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Minimum Rating</h4>
              <div className="space-y-2">
                {[4, 3].map(stars => (
                  <label key={stars} className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="rating" checked={minRating === stars} onChange={() => setMinRating(stars)} className="hidden" />
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${minRating === stars ? 'border-primary bg-primary' : 'border-gray-300 dark:border-gray-600 group-hover:border-primary'}`}>
                      {minRating === stars && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      {stars}.0 & Up <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    </span>
                  </label>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Books Grid Area */}
        <div className="flex-1">
          {/* Active Filters Summary (Mobile/Desktop) */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredBooks.length}</span> results
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => <SkeletonBookCard key={i} />)}
            </div>
          ) : displayedBooks.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedBooks.map(book => (
                  <BookCard 
                    key={book.id} 
                    book={book} 
                    onBorrowRequest={setSelectedBookToBorrow}
                    isBorrowed={borrowedBooks.some(b => b.bookId === book.id)}
                  />
                ))}
              </div>
              
              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <button 
                    onClick={() => setPage(p => p + 1)}
                    className="px-6 py-3 bg-white dark:bg-darkCard border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary transition-colors shadow-sm flex items-center gap-2"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-24 bg-white dark:bg-darkCard rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-10 h-10 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No books found</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
                We couldn't find any books matching your current filters in this branch.
              </p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSubject('all');
                  setAvailableOnly(false);
                  setMinRating(0);
                }}
                className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm"
              >
                Clear all filters
              </button>
            </div>
          )}
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

export default Books;
