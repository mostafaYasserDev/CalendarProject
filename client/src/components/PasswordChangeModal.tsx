import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { X } from 'lucide-react';

interface PasswordChangeModalProps {
  onClose: () => void;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ onClose }) => {
  const { user, changePassword } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    if (user) {
      const success = await changePassword(user.id, currentPassword, newPassword);
      if (success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError('Current password is incorrect');
      }
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content p-0" onClick={e => e.stopPropagation()}>
        <div className="p-4 bg-primary-50 flex justify-between items-center">
          <h3 className="text-xl font-lalezar text-primary-800">Change Password</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {success ? (
            <div className="text-center text-success-600 py-4">
              Password changed successfully!
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="currentPassword" className="label">
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="label">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="label">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 space-x-reverse">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Change Password
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordChangeModal;