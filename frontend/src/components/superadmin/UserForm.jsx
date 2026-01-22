import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { Card, Button, ErrorAlert } from '../common';

const UserForm = ({ user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    role: 'user',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        password: '', // Don't pre-fill password
        full_name: user.full_name || '',
        email: user.email || '',
        role: user.role || 'user',
        is_active: user.is_active !== undefined ? user.is_active : true,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }
    if (!user && !formData.password.trim()) {
      setError('Password is required for new users');
      return;
    }
    if (!formData.full_name.trim()) {
      setError('Full name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    setLoading(true);

    try {
      const dataToSend = { ...formData };
      
      // If editing and password is empty, don't send it
      if (user && !dataToSend.password) {
        delete dataToSend.password;
      }

      if (user) {
        await userAPI.update(user.id, dataToSend);
      } else {
        await userAPI.create(dataToSend);
      }

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={user ? 'Edit User' : 'Add New User'} icon={user ? '✏️' : '➕'}>
      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              placeholder="Enter username"
              required
              disabled={!!user} // Can't change username when editing
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Password {!user && <span className="text-red-500">*</span>}
              {user && <span className="text-gray-500 text-sm">(leave empty to keep current)</span>}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              placeholder={user ? "Leave empty to keep current" : "Enter password"}
              required={!user}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              placeholder="Enter full name"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              placeholder="Enter email"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="ml-3 text-gray-700 font-semibold">Active User</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : user ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default UserForm;