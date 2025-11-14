import React, { useState } from 'react'; // 💡 Import useState

import { Toaster, toast } from 'sonner'

const AddUserModal = ({ onClose, onSubmit }) => {
  // 💡 --- Step 1: Add state for the form fields ---
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '', // 💡 Added password
    role: 'INSTRUCTOR', // 💡 Default to 'INSTRUCTOR'
  });
  // This state will be for errors passed from the parent
  const [error, setError] = useState(''); 

  const { name, email, password, role } = formData;

  // 💡 --- Step 2: Handle input changes ---
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  // 💡 --- Step 3: Update handleSubmit ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    setError(''); // Clear old errors

    // Basic password validation (you can make this stronger)
    if (password.length < 5) {
      setError('Password must be at least 5 characters long.');
      return;
    }

    try {
      await onSubmit(formData);
      toast.success('User added successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to add user.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Add New User</h3>
        </div>
        
        {/* Modal Body: Form Fields */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* 💡 --- Show API Error --- */}
            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input 
                type="text" 
                name="name" // 💡 Add name
                value={name} // 💡 Add value
                onChange={onChange} // 💡 Add onChange
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                name="email" // 💡 Add name
                value={email} // 💡 Add value
                onChange={onChange} // 💡 Add onChange
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                required 
              />
            </div>

            {/* 💡 --- ADDED PASSWORD FIELD --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Initial Password</label>
              <input 
                type="password" 
                name="password" // 💡 Add name
                value={password} // 💡 Add value
                onChange={onChange} // 💡 Add onChange
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                placeholder="Min. 5 characters"
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select 
                name="role" // 💡 Add name
                value={role} // 💡 Add value
                onChange={onChange} // 💡 Add onChange
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {/* 💡 Use all-caps values to match your database enum */}
                <option value="INSTRUCTOR">Instructor</option>
                <option value="STUDENT">Student</option>
              </select>
            </div>
          </div>

          {/* Modal Footer: Action Buttons */}
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
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;