import React, { useState } from "react";
import { User, Key } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import PasswordChangeModal from "./PasswordChangeModal";

const UserMenu: React.FC = () => {
  const { user } = useAuthStore();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <>
      <div className="relative group">
        <button className="flex text-inherit items-center gap-2 p-2 rounded-md hover:bg-primary-500 transition-colors">
          <span className="text-sm hidden md:inline-block">{user?.name}</span>
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
            <User size={16} />
          </div>
        </button>

        <div className="absolute left-0 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <Key size={16} />
            <span>Change Password</span>
          </button>
        </div>
      </div>

      {showPasswordModal && (
        <PasswordChangeModal onClose={() => setShowPasswordModal(false)} />
      )}
    </>
  );
};

export default UserMenu;
