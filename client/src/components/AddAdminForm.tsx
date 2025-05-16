import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AddAdminFormProps {
  onClose: () => void;
  onSubmit: (adminData: {
    name: string;
    email: string;
    password: string;
    systemUsername?: string;
  }) => Promise<void>;
  isLoading: boolean;
}

type AdminCreationMethod = 'email' | 'system';

const AddAdminForm: React.FC<AddAdminFormProps> = ({ onClose, onSubmit, isLoading }) => {
  const [creationMethod, setCreationMethod] = useState<AdminCreationMethod>('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [systemUsername, setSystemUsername] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name,
      email,
      password,
      systemUsername: creationMethod === 'system' ? systemUsername : undefined
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="p-4 bg-primary-50 flex justify-between items-center">
          <h3 className="text-xl font-lalezar text-primary-800">Add New Admin</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          <div className="flex border-b mb-4">
            <button
              className={`flex-1 py-2 px-4 text-center ${
                creationMethod === 'email'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setCreationMethod('email')}
            >
              Email & Password
            </button>
            <button
              className={`flex-1 py-2 px-4 text-center ${
                creationMethod === 'system'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setCreationMethod('system')}
            >
              System Username
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="label">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                required
              />
            </div>

            {creationMethod === 'email' ? (
              <>
                <div>
                  <label htmlFor="email" className="label">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="label">Password</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input"
                    required
                  />
                </div>
              </>
            ) : (
              <div>
                <label htmlFor="systemUsername" className="label">System Username</label>
                <input
                  id="systemUsername"
                  type="text"
                  value={systemUsername}
                  onChange={(e) => setSystemUsername(e.target.value)}
                  className="input"
                  required
                  placeholder="Enter system username for auto-login"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This will allow automatic login when running the project locally
                </p>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
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
                disabled={isLoading}
              >
                {isLoading ? 'Adding...' : 'Add Admin'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAdminForm; 