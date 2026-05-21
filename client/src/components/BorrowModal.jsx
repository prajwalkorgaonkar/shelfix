import React, { useState } from 'react';
import { BookOpen, X } from 'lucide-react';

const BorrowModal = ({ book, onClose, onConfirm }) => {
  const [borrowDate, setBorrowDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnDate, setReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!book) return null;
  
  const handleConfirm = () => {
    if (new Date(returnDate) <= new Date(borrowDate)) {
      setError('Return date must be strictly after the borrow date.');
      return;
    }
    setError('');
    onConfirm(book, { borrowDate, returnDate, notes });
    onClose();
  };
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white dark:bg-darkCard rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-2xl w-full max-w-md relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="relative h-48 bg-gray-100 dark:bg-slate-800 flex justify-center items-center shrink-0">
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
           {book.coverImage ? (
             <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
           ) : (
             <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600" />
           )}
           <button onClick={onClose} className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-md transition-colors">
             <X className="w-4 h-4" />
           </button>
           <div className="absolute bottom-4 left-4 z-20">
             <span className="bg-white/90 dark:bg-black/70 backdrop-blur-md text-[10px] font-bold px-2.5 py-1 rounded-full text-gray-800 dark:text-gray-200 border border-white/20 uppercase tracking-wider">
               {book.subject}
             </span>
           </div>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-1">{book.title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{book.author}</p>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800/60">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Available Copies</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{book.availableCopies}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Borrow Date</label>
                <input 
                  type="date" 
                  value={borrowDate} 
                  onChange={(e) => setBorrowDate(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-sm rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Return Date</label>
                <input 
                  type="date" 
                  value={returnDate} 
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-sm rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Notes / Purpose (Optional)</label>
              <textarea 
                rows="2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Why are you borrowing this?"
                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-sm rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none resize-none"
              />
            </div>
            
            {error && (
              <p className="text-xs text-red-500 font-semibold">{error}</p>
            )}
          </div>
          
          <button 
            onClick={handleConfirm}
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-blue-600 transition-colors shadow-sm"
          >
            Confirm Borrow
          </button>
        </div>
      </div>
    </div>
  );
};

export default BorrowModal;
