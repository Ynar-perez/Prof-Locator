import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  CalendarSync,
  Home, 
  NotebookPen, // For "Planner"
  Brain, 
  BarChartBig, // For "Dashboard"
  MoreHorizontal, 
  UserPlus, // For "Invite"
  Zap, // For "Upgrade"
  LogOut,
  ArrowRightToLine, // For the toggle
  Menu, X, Users, GraduationCap, Clock, Search, 
  Plus, Edit2, Trash2, MoreVertical, ChevronDown,
  Calendar, UserCheck, UserX, Bell, Settings
} from 'lucide-react';

import StatsCard from '../components/admin/StatsCard';
import ScheduleModal from '../components/admin/ScheduleModal';
import AddUserModal from '../components/admin/AddUserModal';


const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('instructors');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCloseModal = () => {
    setShowScheduleModal(false);
    setSelectedUser(null);
  };

  const handleAddUserSubmit = (formData) => {
    console.log('User data submitted:', formData);
    // Place your API call or data manipulation logic here
  };

  // Mock data
  const stats = [
    { title: 'Total Instructors', value: '24', icon: GraduationCap, color: 'bg-blue-500' },
    { title: 'Active Students', value: '156', icon: Users, color: 'bg-violet-500' },
  ];

  const users = [
    { id: 1, name: 'John Smith', email: 'john@example.com', role: 'Instructor', status: 'Active', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Student', status: 'Active', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
    { id: 3, name: 'Mike Chen', email: 'mike@example.com', role: 'Instructor', status: 'Active', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
    { id: 4, name: 'Emily Davis', email: 'emily@example.com', role: 'Student', status: 'Pending', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
    { id: 5, name: 'David Wilson', email: 'david@example.com', role: 'Instructor', status: 'Inactive', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
  ];

  const filteredUsers = users.filter(u => 
    (activeTab === 'instructors' ? u.role === 'Instructor' : u.role === 'Student') &&
    (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const StatusBadge = ({ status }) => {
    const colors = {
      Active: 'bg-green-100 text-green-700',
      Pending: 'bg-yellow-100 text-yellow-700',
      Inactive: 'bg-gray-100 text-gray-700'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status}
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
        {/* 'J' Logo from screenshot */}
        <button className="flex items-center justify-center w-12 h-12 bg-teal-600 rounded-xl text-xl font-bold">
          J
        </button>
        
        {/* Close button for mobile (from your original code) */}
        {/* <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400">
          <X className="w-6 h-6" />
        </button> */}
      </div>

      <hr className="w-10 border-gray-700" />

      {/* --- Middle Section: Main Nav --- */}
      <nav className="flex flex-col items-center space-y-2 flex-grow w-full px-2">
        {/* Each link is a 'relative group' to allow for the 'absolute' tooltip */}
        
        <a 
          href="#" 
          className="relative group flex justify-center items-center w-12 h-12 
            border border-gray-400 rounded-xl 
            hover:bg-blue-600/90 transition-colors"
        >
          <Users className="w-6 h-6 text-gray-400 group-hover:text-white" />
          {/* Tooltip */}
          <span className="absolute left-full ml-5 px-3 py-1.5 bg-blue-600/90 rounded-md text-sm font-medium text-white whitespace-nowrap invisible opacity-0 scale-95 group-hover:visible group-hover:opacity-100 group-hover:scale-100 transition-all duration-150">
            User Management
          </span>
        </a>
        <span className="text-xs text-black font-medium">
          Users
        </span>
        <hr className="w-10 border-gray-700 my-2" />

        <a 
          href="#" 
          className="
            relative group flex flex-col items-center justify-center w-12 h-12 rounded-xl 
            bg-blue-600/90 shadow-lg shadow-blue-500/30 
            transition-colors
          "
        >
          {/* The icon */}
          <CalendarSync className="w-6 h-6 text-white" />
          
          {/* The text below the icon */}
          <span className="absolute left-full ml-5 px-3 py-1.5 bg-blue-600/90 rounded-md text-sm font-medium text-white whitespace-nowrap invisible opacity-0 scale-95 group-hover:visible group-hover:opacity-100 group-hover:scale-100 transition-all duration-150">
            Planer
          </span>
          
        </a>
        <span className="text-xs text-black font-medium">
          Planner
        </span>

        <hr className="w-10 border-gray-200 my-2" />
      </nav>

      {/* --- Bottom Section: Invite, Upgrade, Logout --- */}
      {/* 'mt-auto' is removed because 'flex-grow' on nav does the job */}
      <div className="flex flex-col items-center space-y-2">
      <button onClick={logout} className="relative group flex justify-center items-center w-12 h-12 rounded-xl border border-gray-300 hover:bg-red-500 hover:border-red-500 transition-colors">
        <LogOut className="w-6 h-6 text-gray-400 group-hover:text-white" />
        <span className="absolute left-full ml-5 px-3 py-1.5 bg-blue-600/90 rounded-md text-sm font-medium text-white whitespace-nowrap invisible opacity-0 scale-95 group-hover:visible group-hover:opacity-100 group-hover:scale-100 transition-all duration-150">
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
                Command Center
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img 
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100" 
                  alt="Admin"
                  className="w-8 h-8 rounded-full"
                />
                <span className="hidden md:block lg:block text-sm font-medium">{user?.name || 'Admin'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="p-4 md:p-6 lg:p-6">
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

          {/* User Management Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row sm:flex-row sm:items-center sm:justify-between md:just md:items-center md:justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-800">User Management</h2>
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Table - Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
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
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">#{user.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{user.role}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {user.role === 'Instructor' && (
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
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards - Mobile/Tablet */}
            <div className="md:hidden p-4 space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <StatusBadge status={user.status} />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-gray-500">ID: #{user.id}</span>
                    <span className="font-medium text-gray-700">{user.role}</span>
                  </div>

                  <div className="flex gap-2">
                    {user.role === 'Instructor' && (
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
                    <button className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium">
                      Edit
                    </button>
                    <button className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Add New User</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" className="w-full px- py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option>Instructor</option>
                  <option>Student</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowAddUserModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:from-blue-700 hover:to-violet-700 transition">
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <AddUserModal
          // PROP 1: Function to close the modal
          onClose={() => setShowAddUserModal(false)}
          // PROP 2: Function to handle form submission
          onSubmit={handleAddUserSubmit}
        />
      )}

      {/* Schedule Modal */}
      {showScheduleModal && selectedUser && (
        <ScheduleModal
          // PROP 1: Pass the dynamic user name
          userName={selectedUser.name}
          // PROP 2: Pass the handler function for closing
          onClose={handleCloseModal}
          // Note: The visibility logic (showScheduleModal && selectedUser && ...)
          // keeps the component unmounted when closed, which is often cleaner.
        />
      )}

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/70 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;