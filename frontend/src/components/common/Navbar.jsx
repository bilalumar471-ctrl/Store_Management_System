//navbar.jsx
import { useNavigate } from 'react-router-dom';
import { getUserDisplayName, getRoleDisplayName, getUserRole, clearAuthData } from '../../utils/auth';
import { useState } from 'react';

const Navbar = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  
  const userName = getUserDisplayName();
  const userRole = getUserRole();
  const roleDisplay = getRoleDisplayName(userRole);

  const handleLogout = () => {
    clearAuthData();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Store Management System
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-right mr-4">
          <p className="text-sm text-gray-600">Welcome back,</p>
          <p className="font-semibold text-gray-800">{userName}</p>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all shadow-md"
          >
            <span className="text-lg">👤</span>
            <span>{roleDisplay}</span>
            <span className="text-xs">▼</span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-10">
              <div className="px-4 py-2 border-b">
                <p className="text-sm text-gray-600">Signed in as</p>
                <p className="font-semibold text-gray-800">{userName}</p>
                <p className="text-xs text-purple-600">{roleDisplay}</p>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-medium"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;