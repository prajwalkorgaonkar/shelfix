import React, { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { useLibrary } from '../contexts/LibraryContext';
import { Edit2, BookOpen, Clock, CheckCircle, Star, History, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white dark:bg-darkCard rounded-[20px] p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-center gap-3 hover:-translate-y-1 transition-all duration-300 hover:shadow-md cursor-default">
    <div className="flex items-center gap-3 mb-2">
      <div className={`p-2.5 rounded-xl ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold tracking-wide uppercase">{title}</p>
    </div>
    <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</h3>
  </div>
);

const Profile = () => {
  const { user } = useAuth();
  const { profile } = useUser();
  const { books, borrowedBooks, returnHistory } = useLibrary();

  // Dynamic statistics
  const activeBorrows = borrowedBooks.length;
  const returnedCount = returnHistory?.length || 0;
  const overdueCount = borrowedBooks.filter(b => new Date(b.dueDate) < new Date()).length;

  const favoriteDepartment = useMemo(() => {
    const allActivity = [...borrowedBooks, ...(returnHistory || [])];
    if (allActivity.length === 0) return 'None yet';
    const counts = allActivity.reduce((acc, curr) => {
      const book = books.find(b => b.id === curr.bookId) || curr;
      const dept = book.category || book.subject || 'General';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});
    const maxDept = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    return maxDept;
  }, [borrowedBooks, returnHistory, books]);

  const recentActivity = useMemo(() => {
    const activity = [
      ...borrowedBooks.map(b => ({ ...b, type: 'borrow', date: new Date(b.borrowDate) })),
      ...(returnHistory || []).map(b => ({ ...b, type: 'return', date: new Date(b.returnDate) }))
    ];
    return activity.sort((a, b) => b.date - a.date).slice(0, 5);
  }, [borrowedBooks, returnHistory]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      
      {/* Profile Header */}
      <div className="bg-white dark:bg-darkCard rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden relative">
        <div className="h-32 md:h-48 bg-gradient-to-r from-primary/20 via-purple-500/20 to-emerald-500/20" />
        <div className="px-6 pb-6 md:px-10 md:pb-10 relative">
          <div className="flex flex-col md:flex-row gap-6 md:items-end -mt-16 md:-mt-20 mb-6">
            <div className="relative">
              {profile.avatar ? (
                <img src={profile.avatar} alt={user?.username} className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-darkCard object-cover bg-white dark:bg-darkCard shadow-lg" />
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-darkCard bg-primary/10 flex items-center justify-center text-primary text-5xl font-bold shadow-lg">
                  {user?.name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    {user?.name || user?.username}
                    <span className="text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/20">
                      {user?.role}
                    </span>
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-1 font-mono">Library ID: {user?.username}</p>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-2 flex items-center gap-1.5">
                     Department: {user?.department || user?.branch || 'System Operations'}
                  </p>
                </div>
                <Link to="/settings" className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition-colors shadow-sm w-full md:w-auto">
                  <Edit2 className="w-4 h-4" /> Edit Profile
                </Link>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-gray-100 dark:border-gray-800 pt-6">
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">About</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                {profile.bio || "No bio provided yet. Update your profile in settings."}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Member Since</h3>
              <p className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                {new Date(profile.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          title="Active Borrows" 
          value={activeBorrows} 
          icon={BookOpen} 
          colorClass="bg-blue-50 dark:bg-blue-900/20 text-blue-500" 
        />
        <StatCard 
          title="Returned Books" 
          value={returnedCount} 
          icon={CheckCircle} 
          colorClass="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500" 
        />
        <StatCard 
          title="Overdue" 
          value={overdueCount} 
          icon={Clock} 
          colorClass="bg-red-50 dark:bg-red-900/20 text-red-500" 
        />
        <StatCard 
          title="Top Category" 
          value={favoriteDepartment} 
          icon={Star} 
          colorClass="bg-purple-50 dark:bg-purple-900/20 text-purple-500" 
        />
      </div>

      {/* Activity Section */}
      <div className="bg-white dark:bg-darkCard rounded-[24px] border border-gray-100 dark:border-gray-800 p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-primary" /> Recent Activity
          </h2>
        </div>
        
        <div className="space-y-6">
          {recentActivity.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No reading activity yet. Time to borrow your first book!</p>
              <Link to="/books" className="inline-block mt-4 text-primary font-semibold hover:underline">
                Explore Library
              </Link>
            </div>
          ) : (
            recentActivity.map((activity, idx) => (
              <div key={`${activity.borrowId}-${activity.type}`} className="flex gap-4 relative group">
                {idx !== recentActivity.length - 1 && (
                  <div className="absolute left-[19px] top-10 bottom-[-24px] w-px bg-gray-200 dark:bg-gray-700" />
                )}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white dark:border-darkCard ${activity.type === 'borrow' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30'}`}>
                  {activity.type === 'borrow' ? <BookOpen className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                </div>
                <div className="flex-1 bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/60 group-hover:border-primary/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-semibold">{user?.name || user?.username}</span> 
                        {activity.type === 'borrow' ? ' borrowed ' : ' returned '} 
                        <span className="font-semibold italic">"{activity.title}"</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.author}</p>
                    </div>
                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500 whitespace-nowrap bg-white dark:bg-darkCard px-2 py-1 rounded-md border border-gray-100 dark:border-gray-700">
                      {activity.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default Profile;
