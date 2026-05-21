import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLibrary } from '../contexts/LibraryContext';
import { User, Bell, Lock, Palette, Upload, Check } from 'lucide-react';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { profile, settings, updateProfile, updateSettings } = useUser();
  const { isDarkMode, toggleTheme } = useTheme();
  const { triggerToast } = useLibrary();

  const [activeTab, setActiveTab] = useState('account');
  const fileInputRef = useRef(null);

  // Local state for forms
  const [formData, setFormData] = useState({
    name: user?.name || user?.username || '',
    bio: profile.bio || ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    updateUser({ name: formData.name });
    updateProfile({ bio: formData.bio });
    triggerToast('Profile updated successfully');
  };

  const handleSettingToggle = (category, key, value) => {
    updateSettings({
      [category]: {
        ...settings[category],
        [key]: value
      }
    });
    triggerToast('Settings saved');
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      triggerToast('Please upload an image file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress image using canvas
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        updateProfile({ avatar: dataUrl });
        triggerToast('Avatar updated successfully');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Lock }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your account preferences and settings.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white dark:bg-darkCard rounded-[24px] border border-gray-100 dark:border-gray-800 p-3 shadow-sm flex flex-col gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-primary/10 text-primary font-semibold' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-darkCard rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm p-6 md:p-8">
          
          {activeTab === 'account' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">Account Profile</h2>
              
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-2 border-gray-100 dark:border-gray-700 shadow-sm" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold border-2 border-primary/20">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full shadow-md hover:bg-blue-600 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" />
                </div>
                <div>
                  <h3 className="text-gray-900 dark:text-white font-semibold">Profile Picture</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">PNG, JPG up to 2MB. Image will be compressed.</p>
                </div>
              </div>

              <div className="space-y-4 max-w-lg pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Library ID</label>
                  <div className="w-full bg-gray-100 dark:bg-slate-700/50 border border-gray-200 dark:border-gray-700 text-sm rounded-xl px-4 py-2.5 text-gray-500 dark:text-gray-400 cursor-not-allowed font-mono">
                    {user?.username}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Institutional ID cannot be changed.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-sm rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bio</label>
                  <textarea 
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-sm rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-colors resize-none"
                  />
                </div>
                
                <div className="pt-4">
                  <button 
                    onClick={handleSaveProfile}
                    className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">Appearance</h2>
              
              <div className="space-y-6 max-w-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Dark Mode</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Toggle dark theme across the application</p>
                  </div>
                  <button 
                    onClick={() => { toggleTheme(); triggerToast(`Switched to ${!isDarkMode ? 'dark' : 'light'} mode`); }}
                    className={`relative w-12 h-6 rounded-full transition-colors ${isDarkMode ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Compact Mode</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Reduce padding for higher data density</p>
                  </div>
                  <button 
                    onClick={() => handleSettingToggle('appearance', 'compactMode', !settings.appearance.compactMode)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${settings.appearance.compactMode ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.appearance.compactMode ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">Notification Preferences</h2>
              
              <div className="space-y-6 max-w-lg">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Receive alerts for {key.replace(/([A-Z])/g, ' $1').toLowerCase()}</p>
                    </div>
                    <button 
                      onClick={() => handleSettingToggle('notifications', key, !value)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${value ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">Privacy Controls</h2>
              
              <div className="space-y-6 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Profile Visibility</label>
                  <select 
                    value={settings.privacy.profileVisibility}
                    onChange={(e) => handleSettingToggle('privacy', 'profileVisibility', e.target.value)}
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-sm rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                  >
                    <option value="Public">Public - Visible to everyone</option>
                    <option value="Institution">Institution Only</option>
                    <option value="Private">Private</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Activity Visibility</label>
                  <select 
                    value={settings.privacy.activityVisibility}
                    onChange={(e) => handleSettingToggle('privacy', 'activityVisibility', e.target.value)}
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-sm rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                  >
                    <option value="Public">Public</option>
                    <option value="Private">Private - Only me</option>
                  </select>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
