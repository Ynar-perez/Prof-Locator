import React, { useState, useEffect } from 'react';

// We accept the user object, an onClose function, and an onSubmit function
const EditUserModal = ({ user, onClose, onSubmit }) => {
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'STUDENT', // Default
    password: '', // This will be for "New Password"
  });
  const [error, setError] = useState('');

  // 💡 This is the most important part!
  // This effect runs when the 'user' prop changes (i.e., when the modal opens)
  useEffect(() => {
    if (user) {
      // We fill the form data with the user's existing info
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'STUDENT',
        password: '', // We always leave password blank
      });
      setError(''); // Clear any old errors
    }
  }, [user]); // Dependency array: re-run when 'user' changes

  const { name, email, role, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Create the 'updates' object
    const updates = { name, email, role };

    // 2. ONLY add the password if the user typed one in
    if (password) {
      if (password.length < 5) {
        setError('New password must be at least 5 characters long.');
        return;
      }
      updates.password = password;
    }

    try {
      // 3. Call the parent's submit function with the user's ID and the updates
      await onSubmit(user._id, updates);
      
      // The parent component will be responsible for closing the modal
      // by setting its own state.
    } catch (err) {
      // The parent's submit function might throw an error (e.g., email taken)
      setError(err.message || 'Failed to update user.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Edit User: {user.name}</h3>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input 
                type="text" 
                name="name"
                value={name}
                onChange={onChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                name="email"
                value={email}
                onChange={onChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password (Optional)</label>
              <input 
                type="password" 
                name="password"
                value={password}
                onChange={onChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                placeholder="Leave blank to keep same password"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select 
                name="role"
                value={role}
                onChange={onChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="INSTRUCTOR">Instructor</option>
                <option value="STUDENT">Student</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 px-4 py-2 bg-gradient-to-br from-blue-600 to-violet-600 text-white rounded-lg hover:from-blue-700 hover:to-violet-700 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;