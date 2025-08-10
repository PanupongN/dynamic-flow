import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

export const LogoutButton: React.FC = () => {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {currentUser && (
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            {currentUser.photoURL ? (
              <img 
                src={currentUser.photoURL} 
                alt="Profile" 
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <User size={16} className="text-blue-600" />
            )}
          </div>
          <span className="font-medium">
            {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
          </span>
        </div>
      )}
      
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        <LogOut size={16} />
        ออกจากระบบ
      </button>
    </div>
  );
};

export default LogoutButton;
