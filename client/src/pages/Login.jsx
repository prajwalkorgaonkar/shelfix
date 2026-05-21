import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const validateUsername = (val) => {
    return /^[a-z0-9]{6}$/.test(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      if (!username || !password) {
        setError('Please enter both username and password.');
        return;
      }
      
      setLoading(true);
      try {
        await login(username, password);
        navigate('/');
      } catch (err) {
        setError(err.message || 'Login failed');
      } finally {
        setLoading(false);
      }
    } else {
      if (!name || !username || !password || !confirmPassword || !department) {
        setError('All fields are required.');
        return;
      }

      if (!validateUsername(username)) {
        setError('Username must be exactly 6 lowercase letters or numbers.');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      setLoading(true);
      try {
        await register({ name, username, password, department });
        navigate('/');
      } catch (err) {
        setError(err.message || 'Registration failed');
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setUsername('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setDepartment('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-darkCard rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isLogin ? 'Welcome back' : 'Create an Account'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm text-center">
            {isLogin 
              ? 'Sign in to your library account' 
              : 'Register for a new institutional library ID'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-3 rounded-lg text-sm mb-5 text-center animate-in fade-in duration-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLogin && (
            <div className="animate-in slide-in-from-top-2 fade-in duration-300">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white text-sm"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isLogin ? 'Library ID (Username)' : 'Username (6 chars, lowercase/numbers)'}
            </label>
            <input 
              type="text" 
              className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border ${
                !isLogin && username && !validateUsername(username) ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-primary/20'
              } rounded-xl focus:ring-2 outline-none transition-all dark:text-white text-sm font-mono`}
              placeholder={isLogin ? "e.g. cs2025" : "e.g. ab1234"}
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              maxLength={6}
            />
          </div>

          {!isLogin && (
            <div className="animate-in slide-in-from-top-2 fade-in duration-300">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department / Branch</label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white text-sm"
                placeholder="e.g. Computer Science"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white text-sm pr-10"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="animate-in slide-in-from-top-2 fade-in duration-300">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
              <input 
                type="password"
                className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border ${
                  confirmPassword && password !== confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-primary/20'
                } rounded-xl focus:ring-2 outline-none transition-all dark:text-white text-sm`}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}
          
          <button 
            type="submit"
            disabled={loading || (!isLogin && username && !validateUsername(username))}
            className="w-full bg-primary hover:bg-blue-600 text-white py-2.5 rounded-xl font-medium transition-colors mt-6 disabled:opacity-70 flex justify-center shadow-sm"
          >
            {loading ? (isLogin ? 'Signing in...' : 'Creating Account...') : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isLogin ? "Don't have a Library ID?" : "Already have an account?"}
            <button 
              onClick={toggleMode}
              className="ml-1 text-primary font-semibold hover:underline"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {isLogin && (
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-400 dark:text-gray-500">
            Demo Accounts:<br/>
            <span className="font-mono bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">admin1</span> (admin123) / <span className="font-mono bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">cs2025</span> (student123)
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
