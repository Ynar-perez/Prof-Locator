import React, { useState } from 'react'; // 💡 Import useState

import { Toaster, toast } from 'sonner'
import AvatarUpload from '../shared/AvatarUpload';

const AddUserModal = ({ onClose, onSubmit }) => {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'INSTRUCTOR',
  });

  // Separate state for avatar
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // This state will be for errors passed from the parent
  const [error, setError] = useState(''); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { name, email, password, role } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle avatar selection
  const handleAvatarSelect = (file, preview) => {
    setAvatarFile(file);
    setAvatarPreview(preview);
  };
  
  // 💡 --- Step 3: Update handleSubmit ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    setError('');
    setIsSubmitting(true);

    // Basic validation
    if (password.length < 5) {
      setError('Password must be at least 5 characters long.');
      setIsSubmitting(false);
    return;
    }

    // try {
    //   await onSubmit(formData);
    //   toast.success('User added successfully.');
    // } catch (err) {
    //   toast.error(err.message || 'Failed to add user.');
    // }

    try {
      // Create FormData for multipart/form-data
      const submitData = new FormData();
      submitData.append('name', name);
      submitData.append('email', email);
      submitData.append('password', password);
      submitData.append('role', role);
      
      // Only append avatar if one was selected
      if (avatarFile) {
        submitData.append('avatar', avatarFile);
      }

      await onSubmit(submitData);
      toast.success('User added successfully.');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add user.');
      toast.error(err.message || 'Failed to add user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Add New User</h3>
        </div>
        
        {/* Modal Body: Form Fields */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Avatar Upload */}
            <div className="flex justify-center">
              <AvatarUpload
                currentAvatar={avatarPreview}
                onImageSelect={handleAvatarSelect}
                size="lg"
              />
            </div>

            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input 
                type="text" 
                name="name"
                value={name}
                onChange={onChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                placeholder="Enter Name"
                required 
              />
            </div>
            
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input 
                type="email" 
                name="email"
                value={email}
                onChange={onChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                placeholder="john@ccc.edu.ph"
                required 
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Password
              </label>
              <input 
                type="password" 
                name="password"
                value={password}
                onChange={onChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                placeholder="Min. 5 characters"
                required 
              />
            </div>
            
            {/* Role Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select 
                name="role"
                value={role}
                onChange={onChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
              >
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
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gradient-to-br from-blue-600 to-violet-600 text-white rounded-lg hover:from-blue-700 hover:to-violet-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding...' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;