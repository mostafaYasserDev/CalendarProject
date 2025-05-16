import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Shield } from 'lucide-react';

const LocalAdminButton: React.FC = () => {
  const navigate = useNavigate();
  const { localLogin, isLocalAdmin } = useAuthStore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const admin = await isLocalAdmin();
        setIsAdmin(admin);
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAdmin();
  }, [isLocalAdmin]);

  const handleLocalLogin = async () => {
    const success = await localLogin();
    if (success) {
      navigate('/dashboard');
    }
  };

  if (isLoading || !isAdmin) return null;

  return (
    <button
      onClick={handleLocalLogin}
      className="fixed bottom-4 right-4 bg-primary-500 text-white p-2 rounded-full shadow-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
      title="Access Admin Dashboard"
    >
      <Shield size={20} />
      <span className="hidden sm:inline">Admin Access</span>
    </button>
  );
};

export default LocalAdminButton; 