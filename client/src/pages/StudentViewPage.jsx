import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';
import { Search, MapPin, Clock,ChevronLeft,ChevronRight, DoorOpen, Building, LogOut, ChevronDown, Filter, X, Calendar, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import CCC_LOGO from '../assets/CCC-Logo.png'

// Helper function to get initials
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (parts[0][0] || '?').toUpperCase();
};

// Helper function to get current day
const getTodaysDay = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
};

// Status color mapping
const getStatusStyle = (status) => {
  const styles = {
    'Available': { color: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-100', border: 'border-green-200' },
    'In Class': { color: 'bg-blue-500', textColor: 'text-blue-700', bgColor: 'bg-blue-100', border: 'border-blue-200' },
    'In Meeting': { color: 'bg-purple-500', textColor: 'text-purple-700', bgColor: 'bg-purple-100', border: 'border-purple-200' },
    'Busy': { color: 'bg-orange-500', textColor: 'text-orange-700', bgColor: 'bg-orange-100', border: 'border-orange-200' },
    'Away': { color: 'bg-yellow-500', textColor: 'text-yellow-700', bgColor: 'bg-yellow-100', border: 'border-yellow-200' },
    'Unavailable': { color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-100', border: 'border-red-200' }
  };
  return styles[status] || styles['Available'];
};

// Instructor Card Component
const InstructorCard = ({ instructor, onClick }) => {
  const currentStatus = instructor.currentStatus || {};
  // 1. Get the correct status TEXT from the 'currentStatus' object
  const statusText = currentStatus.status || 'Unavailable';
  
  // 2. Get the style based on that correct status text
  const statusStyle = getStatusStyle(statusText);
  
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 overflow-hidden group"
    >
      <div className="p-4">
        {/* Header with Avatar and Status */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0 overflow-hidden ${!instructor.avatar ? 'bg-gradient-to-br from-blue-400 to-purple-500' : ''}`}>
            {instructor.avatar ? (
              <img 
                src={`${API_URL}${instructor.avatar}`} 
                alt={instructor.name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              getInitials(instructor.name)
            )}
          </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {instructor.name}
              </h3>
              <p className="text-xs text-gray-500 truncate">{instructor.email}</p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full ${statusStyle.bgColor} border ${statusStyle.border} flex-shrink-0 ml-2`}>
            <div className={`w-2 h-2 rounded-full ${statusStyle.color} animate-pulse`}></div>

            <span className={`text-xs font-medium ${statusStyle.textColor}`}>
              {statusText}
            </span>
            
          </div>
        </div>

        {/* Location Info - Now shows CURRENT location from schedule */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center text-sm text-gray-600">
            <Building className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
            <span className="truncate">{currentStatus.location || 'No location'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <DoorOpen className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
            <span className="truncate">{currentStatus.room || 'No room'}</span>
          </div>
        </div>

        {/* Current Schedule (if any) */}
        {/* TODO: this is temporary data for the subjects - will implement later */}
        {/* {instructor.currentSchedule && (
          <div className={`p-2.5 rounded-lg ${statusStyle.bgColor} border ${statusStyle.border}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center min-w-0 flex-1">
                <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-500 flex-shrink-0" />
                <span className="text-xs font-medium text-gray-700 truncate">
                  {instructor.currentSchedule.class}
                </span>
              </div>
              <span className="text-xs text-gray-600 ml-2 whitespace-nowrap">
                {instructor.currentSchedule.time}
              </span>
            </div>
          </div>
        )} */}

        {/* View Schedule Link */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-sm text-blue-600 font-medium group-hover:text-blue-700">
            View Full Schedule →
          </span>
        </div>
      </div>
    </div>
  );
};

// Schedule Modal Component
const ScheduleModal = ({ instructor, onClose, currentStatus }) => {
  const [selectedDay, setSelectedDay] = useState(getTodaysDay());
  const [scrollPosition, setScrollPosition] = useState(0);
  const scheduleDays = ['Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const selectedDaySchedule = (instructor.baseSchedule || [])
    .filter(item => item.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // 1. Get the correct status TEXT from the 'currentStatus' prop
  const statusText = currentStatus.status || 'Unavailable';

  // 2. Get the style based on that correct text
  const statusStyle = getStatusStyle(statusText);

  // Scroll functions for day tabs
  const scrollDays = (direction) => {
    const container = document.getElementById('student-day-tabs-container');
    if (!container) return;
    
    const scrollAmount = 120;
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : Math.min(container.scrollWidth - container.clientWidth, scrollPosition + scrollAmount);
    
    container.scrollTo({ left: newPosition, behavior: 'smooth' });
    setScrollPosition(newPosition);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/70 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex items-start sm:items-center justify-center min-h-screen p-4 pt-16 sm:pt-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all">
          {/* Modal Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0 overflow-hidden ${!instructor.avatar ? 'bg-gradient-to-br from-blue-400 to-purple-500' : ''}`}>
                  {instructor.avatar ? (
                    <img 
                      src={`${API_URL}${instructor.avatar}`} 
                      alt={instructor.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    getInitials(instructor.name)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                    {instructor.name}
                  </h2>
                  <p className="text-sm text-gray-500 truncate">{instructor.email}</p>
                  
                  {/* Status Badge */}
                  <div className="mt-2">
                    <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full ${statusStyle.bgColor} border ${statusStyle.border}`}>
                      <div className={`w-2 h-2 rounded-full ${statusStyle.color} animate-pulse`}></div>
                      <span className={`text-xs font-medium ${statusStyle.textColor}`}>
                        {statusText}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors ml-2 flex-shrink-0"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Current Location */}
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <div className="flex items-center text-sm bg-blue-50 text-blue-700 px-3 py-2 rounded-lg flex-1">
                <Building className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{currentStatus.location || 'No location'}</span>
              </div>
              <div className="flex items-center text-sm bg-blue-50 text-blue-700 px-3 py-2 rounded-lg flex-1">
                <DoorOpen className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{currentStatus.room || 'No room'}</span>
              </div>
            </div>
          </div>

          {/* Modal Body - Schedule */}
          <div className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Weekly Schedule
            </h3>

            {/* Day Tabs */}
            <div className="mb-4 relative">
              <div className="flex items-center">
                {/* Left Arrow */}
                <button
                  onClick={() => scrollDays('left')}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white hover:bg-gray-100 rounded-lg shadow-sm mr-1 transition-colors lg:hidden"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>

                <div
                  className="flex-1 overflow-x-auto scrollbar-hide border-b border-gray-200"
                  id="student-day-tabs-container"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                  <div className="flex space-x-1 min-w-max lg:min-w-0 lg:justify-start">
                  {scheduleDays.map(day => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm rounded-t-lg whitespace-nowrap transition-colors flex-shrink-0 ${
                        selectedDay === day
                          ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

                  {/* Right Arrow */}
                  <button
                    onClick={() => scrollDays('right')}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white hover:bg-gray-100 rounded-lg shadow-sm ml-1 transition-colors lg:hidden"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                  </div>
            </div>

            {/* Schedule List */}
            <div className="max-h-96 overflow-y-auto">
              {selectedDaySchedule.length > 0 ? (
                <ul className="space-y-3">
                  {selectedDaySchedule.map((item, index) => (
                    <li key={item._id || index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-shrink-0 w-14 text-center">
                        <p className="text-sm font-bold text-blue-600">{item.startTime}</p>
                        <p className="text-xs text-gray-400">to</p>
                        <p className="text-sm font-bold text-blue-600">{item.endTime}</p>
                      </div>
                      <div className="border-l-2 border-blue-200 pl-3 flex-1 min-w-0">
                        {/* TODO: this is temporary data for the subjects - will implement later */}
                        {/* <p className="font-semibold text-gray-800 truncate mb-2">{item.class}</p> */}
                        <p className="font-semibold text-gray-800 truncate mb-2">{item.status}</p>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600 flex items-center">
                            <Building className="w-3.5 h-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{item.location || 'No location'}</span>
                          </p>
                          <p className="text-xs text-gray-600 flex items-center">
                            <DoorOpen className="w-3.5 h-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{item.room || 'No room'}</span>
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm font-medium">No classes on {selectedDay}</p>
                  <p className="text-gray-400 text-xs mt-1">This day is free</p>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  
  // State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch instructors from backend
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/users/instructors`, {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
        });

        setInstructors(response.data);
      } catch (err) {
        console.error('Error fetching instructors:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user.isAuthenticated) {
      fetchInstructors();
    }
  }, [user.isAuthenticated]);

  // Filter instructors based on search and status
  const filteredInstructors = instructors.filter(instructor => {
    const matchesSearch = instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         instructor.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // UPDATED: Access the nested currentStatus object to match the UI Card
    const statusObj = instructor.currentStatus || {};
    // Default to 'Unavailable' if missing, to match InstructorCard logic
    const displayStatus = statusObj.status || 'Unavailable'; 
    
    const matchesStatus = statusFilter === 'All' || displayStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = ['All', 'Available', 'In Class', 'In Meeting', 'Busy', 'Away', 'Unavailable'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            
            {/* Left Side: Profile */}
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className="relative flex-shrink-0">

                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center hover:shadow-md transition-shadow overflow-hidden"
                >
                  <img
                    src={CCC_LOGO}
                    alt="CCC Logo"
                    className="w-full h-full object-cover" 
                  />
                </button>
                
                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div 
                    className="absolute left-0 mt-2 w-64 bg-white rounded shadow-xl py-1 z-50 ring ring-black ring-opacity-5"
                    onMouseLeave={() => setIsProfileOpen(false)}
                  >
                    <div className="flex flex-row gap-1 py-1">
                      <div
                        className="ml-2 w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center hover:shadow-md transition-shadow"
                      >
                        {user.avatar ? (
                            <img 
                              src={`${API_URL}${user.avatar}`}
                              alt={user.name} 
                              className="w-auto h-auto object-cover rounded-lg" 
                            />
                          ) : (
                            <span className="text-white font-bold text-base sm:text-lg">
                              {getInitials(user.name)}
                            </span>
                          )}
                      </div>
                    <div className="px-1">
                      <p className="text-sm font-medium text-gray-900">{user.name || 'Student'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{user.email || 'No email'}</p>
                    </div>
                    </div>

                    <div className="border-t border-gray-100"></div>
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log Out
                    </button>
                    
                  </div>
                )}
              </div>
              
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                  ProfLocator
                </h1>
                
                <p className="text-xs text-gray-500 hidden sm:block">Student Portal</p>
              </div>
            </div>
            
            

            {/* Right Side: Filter Button (Mobile) */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="sm:hidden flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        
        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter Dropdown (Desktop) */}
            <div className="hidden sm:block relative w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Mobile Filter Dropdown */}
          {isFilterOpen && (
            <div className="sm:hidden mt-3 pt-3 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setIsFilterOpen(false);
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      statusFilter === status
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                        : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading instructors...</p>
          </div>
        )}

        {/* Results Count */}
        {!loading && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredInstructors.length}</span> instructor{filteredInstructors.length !== 1 ? 's' : ''}
              {statusFilter !== 'All' && ` with status "${statusFilter}"`}
            </p>
          </div>
        )}

        {/* Instructors Grid */}
        {!loading && filteredInstructors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInstructors.map(instructor => (
              <InstructorCard
                key={instructor._id}
                instructor={instructor}
                onClick={() => setSelectedInstructor(instructor)}
              />
            ))}
          </div>
        ) : !loading && (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl">
            <User className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No instructors found</h3>
            <p className="text-sm text-gray-500 text-center max-w-md">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </main>

      {/* Schedule Modal */}
      {selectedInstructor && (
        <ScheduleModal
          instructor={selectedInstructor}
          onClose={() => setSelectedInstructor(null)}
          currentStatus={selectedInstructor.currentStatus || {}}
        />
      )}
    </div>
  );
};

export default StudentDashboard;