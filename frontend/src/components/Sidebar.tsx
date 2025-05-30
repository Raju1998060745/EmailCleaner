import React from 'react';
import { Mail, BarChart2, RefreshCw, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Sidebar = () => {
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);

  const handleLogout = () => {
    // Clear any cookies or local storage if needed
    localStorage.removeItem('user');
    sessionStorage.clear();
    
    // Call the logout action from the store
    logout();
    
    // Redirect to landing page
    navigate('/');
  };

  return (
    <aside className="w-16 md:w-64 bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300">
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-center md:justify-start px-4 border-b border-gray-800">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
          <Mail size={16} className="text-white" />
        </div>
        <span className="hidden md:block ml-3 font-bold text-lg">MailSync</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6">
        <ul>
          <li className="mb-2">
            <a 
              href="/dashboard" 
              className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg mx-2 transition-colors"
            >
              <BarChart2 size={20} />
              <span className="hidden md:block ml-3">Dashboard</span>
            </a>
          </li>
          <li className="mb-2">
            <a 
              href="/dashboard" 
              className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg mx-2 transition-colors"
            >
              <RefreshCw size={20} />
              <span className="hidden md:block ml-3">Sync</span>
            </a>
          </li>
          <li className="mb-2">
            <a 
              href="/dashboard" 
              className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg mx-2 transition-colors"
            >
              <Settings size={20} />
              <span className="hidden md:block ml-3">Settings</span>
            </a>
          </li>
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-800">
        <button 
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="hidden md:block ml-3">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;