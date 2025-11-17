import React, { useState, useEffect, useCallback } from 'react'; // Add useEffect & useCallback
import axios from 'axios';
import API_URL from '../apiConfig';
import { useAuth } from '../context/AuthContext';
import { 
  ChartColumnBig,
  LogOut,
  Menu, Users, GraduationCap, Clock, Search, 
  Plus, Edit2, Trash2, MoreVertical, ChevronDown,
  Calendar, UserCheck, UserX, Bell, Settings
} from 'lucide-react';

import CCC_LOGO from '../assets/CCC-Logo.png'
import ProfLocatorLogo from '../assets/ProfLocator-Circle.png'

import ConfirmationDialog from '../components/shared/ConfirmationDialog';
import { toast } from 'sonner';

import StatsCard from '../components/admin/StatsCard';
import ScheduleModal from '../components/admin/ScheduleModal';
import AddUserModal from '../components/admin/AddUserModal';
import EditUserModal from '../components/admin/EditUserModal';
import BarChart from '../components/admin/BarChart';


const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeModule, setActiveModule] = useState('analytics');
  const [activeTab, setActiveTab] = useState('instructors');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [allUsers, setAllUsers] = useState([]); // This will hold our real data
  const [isLoading, setIsLoading] = useState(true); // For a loading spinner
  const [error, setError] = useState(null); // To show API errors

  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const initiateDelete = (user) => {
    setUserToDelete({ id: user._id, name: user.name }); 
    setShowDeleteAlert(true);
  };

  const getAuthHeaders = useCallback(() => {
    const token = user.token;
    if (!token) {
      logout(); // or handle expired token
      return {};
    }
    return {
      headers: {
        'x-auth-token': token,
      },
    };
  }, [user.token, logout]);

  // 💡 --- FETCH USERS FUNCTION ---
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/users`, getAuthHeaders());
      setAllUsers(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError('Failed to fetch users. Please refresh.');
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]); // Re-run if auth headers change

  // 💡 --- LOAD DATA ON MOUNT ---
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // Run this function when the component loads

  // !!--- DERIVE STATS FROM LIVE DATA ---
  const instructorCount = allUsers.filter(u => u.role === 'INSTRUCTOR').length;
  const studentCount = allUsers.filter(u => u.role === 'STUDENT').length;

  const stats = [
    { title: 'Total Instructors', value: instructorCount, icon: GraduationCap, color: 'bg-blue-500' },
    { title: 'Active Students', value: studentCount, icon: Users, color: 'bg-violet-500' },
  ];

  const handleCloseModal = () => {
    setShowScheduleModal(false);
    setSelectedUser(null);
  };

  const handleSidebarClick = (moduleName) => {
    setActiveModule(moduleName);
    setSidebarOpen(false); // Close sidebar on mobile
  };

  // !! --- 'ADD USER' FUNCTION ---
  const handleAddUserSubmit = async (formData) => {
    console.log('Adding new user:', formData);
    try {
      // formData should be { name, email, password, role }
      const res = await axios.post(`${API_URL}/api/users/register`, formData, getAuthHeaders());
      console.log('User created:', res.data);
      
      // Add new user to our state to refresh the list instantly
      setAllUsers([...allUsers, res.data.user]);
      setShowAddUserModal(false); // Close the modal
      
    } catch (err) {
      console.error("Error adding user:", err.response?.data?.msg || err.message);
      // You should add an error state to your AddUserModal to show this
    }
  };

  const confirmDeleteUser = async () => {
    // Use the destructured values for clarity
    const { id: userId, name } = userToDelete || {}; 
  
    if (!userId) return;
    
    try {
      // Use userId for the API call
      await axios.delete(`${API_URL}/api/users/${userId}`, getAuthHeaders());
      setAllUsers(prevUsers => prevUsers.filter(u => u._id !== userId));
      
      // Use the stored 'name' in the toast message
      toast.success(`User ${name} deleted successfully.`);
      
    } catch (err) {
      console.error("Error deleting user:", err.response?.data?.msg || err.message);
      setError('Failed to delete user.');
      
      toast.error(err.response?.data?.msg || `Failed to delete user ${name}.`, {
        description: 'Please check the network connection or permissions.',
      });
      
    } finally {
      // Clear the stored user object
      setUserToDelete(null); 
      setShowDeleteAlert(false);
    }
  };

  const handleOpenEditModal = (user) => {
    setSelectedUser(user); // Set the user to be edited
    setShowEditModal(true); // Open the modal
  };

  const handleEditUserSubmit = async (userId, updates) => {
    try {
      // Your backend 'updates' object can handle {name, email, role, password}
      const res = await axios.put(`${API_URL}/api/users/${userId}`, updates, getAuthHeaders());
      
      // Update the user in our main 'allUsers' state
      setAllUsers(prevUsers => 
        prevUsers.map(u => 
          u._id === userId ? res.data.user : u 
        )
      );
      
      toast.success(`User ${res.data.user.name} updated successfully.`);
      setShowEditModal(false); // Close the modal
      setSelectedUser(null); // Clear the selected user
      
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to update user.';
      console.error("Error updating user:", errorMsg);
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateSchedule = async (userId, schedule) => {
    return axios.put(`${API_URL}/api/users/${userId}/schedule`, schedule, getAuthHeaders());
  };

  // !! --- FILTERED USERS ---
  const filteredUsers = allUsers.filter(u => 
    (activeTab === 'instructors' ? u.role === 'INSTRUCTOR' : u.role === 'STUDENT') &&
    (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const StatusBadge = ({ user }) => {
    // Default to a "general" status
    let statusText = 'Active';
    let color = 'bg-green-100 text-green-700';

    // If the user is an INSTRUCTOR, use their specific status
    if (user.role === 'INSTRUCTOR') {
      statusText = user.instructorStatus || 'Unavailable'; // Use instructorStatus
      
      switch (statusText) {
        case 'Available':
          color = 'bg-green-100 text-green-700';
          break;
        case 'In Class':
        case 'In Meeting':
        case 'Busy':
          color = 'bg-yellow-100 text-yellow-700';
          break;
        case 'Away':
          color = 'bg-blue-100 text-blue-700';
          break;
        case 'Unavailable':
        default:
          color = 'bg-gray-100 text-gray-700';
          break;
      }
    } else {
      // For STUDENT or ADMIN, we'll just show 'Active'
      // since they don't have a special status.
      // You can change this to 'N/A' if you prefer.
      statusText = 'Active'; 
      color = 'bg-green-100 text-green-700';
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {statusText}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-violet-50 to-purple-50">
      {/* Sidebar */}
    <aside 
      className={`
        fixed inset-y-0 left-0 z-50 w-20 bg-white border-b border-gray-200 shadow-md text-white 
        transform transition-transform duration-300 lg:translate-x-0 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col items-center py-4 space-y-4
      `}
    >
      {/* --- Top Section: Logo & Toggle --- */}
      <div className="flex flex-col items-center space-y-4">

        <img className='h-16 w-16' src={ProfLocatorLogo} alt="Proflocator Icon" />
        
        {/* Close button for mobile (from your original code) */}
        {/* <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400">
          <X className="w-6 h-6" />
        </button> */}
      </div>

      <hr className="w-10 border-gray-700" />

      {/* --- Middle Section: Main Nav --- */}
      <nav className="flex flex-col items-center space-y-2 flex-grow w-full px-2">
        
        {/* --- ANALYTICS TAB --- */}
        <a 
          onClick={() => handleSidebarClick('analytics')}
          href="#"
          className={`
            relative group flex justify-center items-center w-12 h-12 
            rounded-xl transition-colors
            ${activeModule === 'analytics' ? 'bg-blue-600 shadow-lg shadow-blue-500/30' : 'border border-gray-400 hover:bg-blue-600/90'}
          `}
        >
          <ChartColumnBig 
            className={`w-6 h-6 ${activeModule === 'analytics' ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}  
          />
          {/* Tooltip */}
          <span className="absolute left-full ml-5 px-3 py-1.5 bg-blue-600/90 rounded-md text-sm font-medium text-white whitespace-nowrap invisible opacity-0 scale-95 group-hover:visible group-hover:opacity-100 group-hover:scale-100 transition-all duration-150">
            Dashboard
          </span>
        </a>
        <span className="text-xs text-black font-medium">
          Analytics
        </span>
        <hr className="w-10 border-gray-700 my-2" />

        {/* --- USERS TAB --- */}
        <a 
          onClick={() => handleSidebarClick('users')}
          href="#" 
          className={`
            relative group flex justify-center items-center w-12 h-12 
            rounded-xl transition-colors
            ${activeModule === 'users' ? 'bg-blue-600 shadow-lg shadow-blue-500/30' : 'border border-gray-400 hover:bg-blue-600/90'}
          `}
        >
          <Users 
            className={`w-6 h-6 ${activeModule === 'users' ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} 
          />
          
          {/* The text below the icon */}
          <span className="absolute left-full ml-5 px-3 py-1.5 bg-blue-600/90 rounded-md text-sm font-medium text-white whitespace-nowrap invisible opacity-0 scale-95 group-hover:visible group-hover:opacity-100 group-hover:scale-100 transition-all duration-150">
            User Management
          </span>
          
        </a>
        <span className="text-xs text-black font-medium">
          Users
        </span>

        <hr className="w-10 border-gray-200 my-2" />
      </nav>

      {/* --- Bottom Section: Invite, Upgrade, Logout --- */}
      <div className="flex flex-col items-center space-y-2">
      <button onClick={logout} className="relative group flex justify-center items-center w-12 h-12 rounded-xl border border-gray-300 hover:bg-red-500 hover:border-red-500 transition-colors">
        <LogOut className="w-6 h-6 text-gray-400 group-hover:text-white" />
        <span className="absolute left-full ml-5 px-3 py-1.5 bg-red-600/90 rounded-md text-sm font-medium text-white whitespace-nowrap invisible opacity-0 scale-95 group-hover:visible group-hover:opacity-100 group-hover:scale-100 transition-all duration-150">
          Logout
        </span>
      </button>
    </div>
    </aside>

      {/* Main Content */}
      <div className="lg:ml-20">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                {/* 💡 Dynamic Header Title */}
                {activeModule === 'analytics' && 'Analytics Dashboard'}
                {activeModule === 'users' && 'User Management'}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img
                  src={CCC_LOGO}
                  alt="CCC Logo"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center hover:shadow-md transition-shadow"
                  >
                </img>
                <span className="hidden md:block lg:block text-sm font-medium">{user?.name || 'Admin'}</span>
              </div>  
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="p-4 md:p-6 lg:p-6">
          {/* RENDER THE USERS MODULE (Current Content) */}
          {activeModule === 'analytics' && (
            <div>
            {/* Stats Cards (Moved Here) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
              {stats.map((stat, idx) => (
                <div key={idx}>
                  <StatsCard
                    title={stat.title}
                    value={stat.value}
                    color={stat.color}
                    icon={stat.icon}
                  />
                </div>
              ))}
            </div>

              {/* Graph */}
              <BarChart 
                instructorCount={instructorCount} 
                studentCount={studentCount} 
              />
            </div>
          )}
        
          {/* --- USERS MODULE --- */}
          {activeModule === 'users' && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Start of User Management Content */}
              <div className="p-4 md:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800">User List</h2>
                  <button 
                    onClick={() => setShowAddUserModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:from-blue-700 hover:to-violet-700 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add User</span>
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-4 border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('instructors')}
                    className={`px-4 py-2 font-medium transition ${
                      activeTab === 'instructors'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Instructors
                  </button>
                  <button
                    onClick={() => setActiveTab('students')}
                    className={`px-4 py-2 font-medium transition ${
                      activeTab === 'students'
                        ? 'text-violet-600 border-b-2 border-violet-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Students
                  </button>
                </div>

                {/* Search */}
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Table - Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  {/* ... (Your <thead> is fine) ... */}
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {isLoading ? (
                      <tr><td colSpan="5" className="p-6 text-center">Loading users...</td></tr>
                    ) : error ? (
                      <tr><td colSpan="5" className="p-6 text-center text-red-500">{error}</td></tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {user.avatar ? (
                                <img 
                                  src={`${API_URL}${user.avatar}`} 
                                  alt={user.name} 
                                  className="w-10 h-10 rounded-full object-cover" 
                                />
                              ) : (
                                <span className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                                  {user.name.charAt(0)}
                                </span>
                              )}
                              <div>
                                <p className="font-medium text-gray-900">{user.name}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">#{user._id}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{user.role}</td>
                          <td className="px-6 py-4">
                            <StatusBadge user={user} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {user.role === "INSTRUCTOR" && (
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowScheduleModal(true);
                                  }}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                >
                                  <Calendar className="w-4 h-4" />
                                </button>
                              )}
                              <button 
                                onClick={() => handleOpenEditModal(user)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => initiateDelete(user)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Cards - Mobile/Tablet */}
              <div className="md:hidden p-4 space-y-4">
                {isLoading ? (
                  <p className="text-center">Loading users...</p>
                ) : error ? (
                  <p className="text-center text-red-500">{error}</p>
                ) : (
                  filteredUsers.map((user) => (
                    <div key={user._id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img 
                              src={`${API_URL}${user.avatar}`} 
                              alt={user.name} 
                              className="w-10 h-10 rounded-full object-cover" 
                            />
                          ) : (
                            <span className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                              {user.name.charAt(0)}
                            </span>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <StatusBadge user={user} />
                      </div>
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-gray-500">ID: #{user._id}</span>
                        <span className="font-medium text-gray-700">{user.role}</span>
                      </div>
                      <div className="flex gap-2">
                        {user.role === 'INSTRUCTOR' && (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowScheduleModal(true);
                            }}
                            className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
                          >
                            Schedule
                          </button>
                        )}
                        <button 
                          onClick={() => handleOpenEditModal(user)}
                          className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => initiateDelete(user)}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {/* End of User Management Content */}
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <AddUserModal
          onClose={() => setShowAddUserModal(false)}
          onSubmit={handleAddUserSubmit} // 💡 This is now connected!
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSubmit={handleEditUserSubmit}
        />
      )}

      {/* Schedule Modal */}
      {showScheduleModal && selectedUser && (
        <ScheduleModal
          user={selectedUser}
          onClose={handleCloseModal}
          onSubmit={handleEditUserSubmit} // 💡 Pass the submit handler
        />
      )}

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/70 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <ConfirmationDialog
        // State control props
        open={showDeleteAlert}
        onOpenChange={setShowDeleteAlert}
        
        // Confirmation action prop
        onConfirm={confirmDeleteUser}
        
        // Content props
        title="Confirm User Deletion"
        description="This action cannot be undone. This will permanently delete the user account and remove their data from our servers."
        continueText="Yes, Delete User"
      />

    </div>
  );
};

export default AdminDashboard;