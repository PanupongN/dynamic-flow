import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginButton from './LoginButton';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  fallback = (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ยินดีต้อนรับสู่ Dynamic Flow Builder
          </h2>
          <p className="text-gray-600 mb-8">
            กรุณาเข้าสู่ระบบเพื่อใช้งาน Form Builder
          </p>
          <LoginButton />
        </div>
      </div>
    </div>
  )
}) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default AuthGuard;
