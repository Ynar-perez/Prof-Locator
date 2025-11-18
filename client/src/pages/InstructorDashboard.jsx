import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';
import { X, Clock, DoorOpen, MapPin, Calendar, Building, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import CCC_LOGO from '../assets/CCC-Logo.png'

// Helper to get PH Time Object
const getManilaDate = () => {
  const now = new Date();
  const manilaTime = now.toLocaleString("en-US", { timeZone: "Asia/Manila" });
  return new Date(manilaTime);
};

// Helper function to get the current day of the week
const getTodaysDay = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  // Use getManilaDate() instead of new Date()
  return days[getManilaDate().getDay()];
};

// Helper function to get current schedule item based on time
const getCurrentScheduleItem = (schedule = []) => {
  // Use getManilaDate() here too
  const now = getManilaDate();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const todayName = getTodaysDay();
  
  const todaySchedule = schedule.filter(item => item.dayOfWeek === todayName);
  const current = todaySchedule.find(item => {
    return currentTime >= item.startTime && currentTime < item.endTime;
  });
  
  return current || null;
};

// Helper function to get initials (e.g., "Sarah Johnson" -> "SJ")
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (parts[0][0] || '?').toUpperCase();
};
// A reusable component to display a single schedule item
const ScheduleItem = ({ item }) => (
  <li className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    <div className="flex-shrink-0 w-14 text-center">
      <p className="text-sm font-bold text-blue-600">{item.startTime || '--:--'}</p>
      <p className="text-xs text-gray-400">to</p>
      <p className="text-sm font-bold text-blue-600">{item.endTime || '--:--'}</p>
    </div>
    <div className="border-l-2 border-blue-200 pl-3 flex-1 min-w-0">
      <div className="flex flex-row align-middle items-center gap-1">
        <p className="font-semibold text-gray-800 truncate mb-2">Subject Name</p>
        <span className='px-2 py-1 bg-blue-600/90 rounded-full font-semibold text-white mb-2 text-xs'>{item.status || 'No Status'}</span>
      </div>
      <div className="space-y-1.5">
        <p className="text-xs text-gray-600 flex items-center">
          <Building className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 text-gray-400" />
          <span className="truncate">{item.location || 'No location specified'}</span>
        </p>
        <p className="text-xs text-gray-600 flex items-center">
          <DoorOpen className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 text-gray-400" />
          <span className="truncate">{item.room || 'No room assigned'}</span>
        </p>
      </div>
    </div>
  </li>
  
);

const InstructorStatusDashboard = () => {
  const { user, logout } = useAuth();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Profile Dropdown State
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Data State
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data State - Mock data for demo
  // const [dashboardData, setDashboardData] = useState({
  //   profile: {
  //     name: 'Dr. Sarah Johnson',
  //     email: 'sarah.johnson@university.edu'
  //   },
  //   currentState: {
  //     status: 'Available',
  //     location: 'Engineering Building',
  //     room: 'Room 304'
  //   },
  //   fullSchedule: [
  //     {
  //       _id: '1',
  //       dayOfWeek: 'Monday',
  //       startTime: '08:00',
  //       endTime: '10:00',
  //       status: 'Advanced Mathematics',
  //       location: 'Science Building',
  //       room: 'Room 201'
  //     },
  //     {
  //       _id: '2',
  //       dayOfWeek: 'Monday',
  //       startTime: '13:00',
  //       endTime: '15:00',
  //       status: 'Calculus I',
  //       location: 'Engineering Building',
  //       room: 'Room 304'
  //     },
  //     {
  //       _id: '3',
  //       dayOfWeek: 'Wednesday',
  //       startTime: '10:00',
  //       endTime: '12:00',
  //       status: 'Linear Algebra',
  //       location: 'Math Building',
  //       room: 'Room 105'
  //     }
  //   ]
  // });
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState(null);



  // UI State
  const [selectedScheduleDay, setSelectedScheduleDay] = useState(getTodaysDay());
  const scheduleDays = ['Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  

  // Helper function to get auth headers with JWT token
  const getAuthHeaders = () => {
    const token = user.token;
    if (!token) {
      logout(); // Token missing, log out user
      return {};
    }
    return {
      headers: {
        'x-auth-token': token,
      },
    };
  };

  // Data fetching function
  const fetchDashboardData = async () => {
    // We don't set loading to true here, to allow for background refresh
    setError(null);
    try {
      // This is the single endpoint to get all data for the dashboard
      const response = await axios.get(`${API_URL}/api/instructor/me/dashboard`, getAuthHeaders());
      setDashboardData(response.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Could not load dashboard. Please try again later.');
    } finally {
      setIsLoading(false); // Only set loading false *after* initial load
    }
  };

  // Initial data fetch on component mount
  useEffect(() => {
    setIsLoading(true);
    fetchDashboardData();
  }, []); // runs only once

  // Status Override API Call
  const handleSetStatus = async () => {
    if (!selectedStatus || !selectedDuration) return;

    try {
      // This endpoint needs to be created in your backend
      await axios.post(`${API_URL}/api/instructor/me/status-override`, {
        status: selectedStatus,
        duration: selectedDuration, // '30', '60', '120', 'eod'
      }, getAuthHeaders());

      // Update current state
      setDashboardData(prev => ({
        ...prev,
        currentState: {
          ...prev.currentState,
          status: selectedStatus
        }
      }));

      // On success, close modal and refetch data to show new status
      setIsModalOpen(false);
      setSelectedDuration('');
      setSelectedStatus('');
      
      // Refetch all dashboard data to show the new override
      await fetchDashboardData(); 

    } catch (err) {
      console.error('Failed to set status override:', err);
      alert('Error: Could not set status. Please try again.');
    }
  };

  // --- Render Helpers ---
  // Memoize schedule filtering to prevent re-calculation on every render
  const todaysSchedule = React.useMemo(() => {
    if (!dashboardData || !dashboardData.fullSchedule) return [];
    const today = getTodaysDay();
    return dashboardData.fullSchedule
      .filter(item => item.dayOfWeek === today)
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  }, [dashboardData]);

  const selectedDaySchedule = React.useMemo(() => {
    if (!dashboardData || !dashboardData.fullSchedule) return [];
    return dashboardData.fullSchedule
      .filter(item => item.dayOfWeek === selectedScheduleDay)
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  }, [dashboardData, selectedScheduleDay]);





// !! INVESTIGATE


  const [scrollPosition, setScrollPosition] = useState(0);

  // Scroll functions for day tabs
  const scrollDays = (direction) => {
    const container = document.getElementById('day-tabs-container');
    if (!container) return;
    
    const scrollAmount = 120;
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : Math.min(container.scrollWidth - container.clientWidth, scrollPosition + scrollAmount);
    
    container.scrollTo({ left: newPosition, behavior: 'smooth' });
    setScrollPosition(newPosition);
  };










  // Define status options (moved outside for clarity)
  const statusOptions = [
    { value: 'Available', color: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-100' },
    { value: 'In Class', color: 'bg-blue-500', textColor: 'text-blue-700', bgColor: 'bg-blue-100' },
    { value: 'In Meeting', color: 'bg-purple-500', textColor: 'text-purple-700', bgColor: 'bg-purple-100' },
    { value: 'Busy', color: 'bg-orange-500', textColor: 'text-orange-700', bgColor: 'bg-orange-100' },
    { value: 'Away', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgColor: 'bg-yellow-100' },
    { value: 'Unavailable', color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-100' }
  ];


  const durationOptions = [
    { label: '30 minutes', value: '30' },
    { label: '1 hour', value: '60' },
    { label: '2 hours', value: '120' },
    { label: 'Until EOD (5:00 PM)', value: 'eod' }
  ];

  // Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading Dashboard...</p>
      </div>
    );
  }

  // Error State
  if (error || !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-red-500 p-4">
        <div className="text-6xl mb-4">⚠️</div>
        <p className="text-center">{error || 'Failed to load data.'}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const { profile, currentState } = dashboardData;
  const currentStyle = statusOptions.find(s => s.value === currentState.status) || statusOptions[0];
  const currentScheduleItem = getCurrentScheduleItem(dashboardData.fullSchedule);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            
            {/* Left Side: Profile & App Name */}
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              {/* Profile Avatar & Dropdown */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center hover:shadow-md transition-shadow"
                >
                  {/* Dont Change this this is the School Logo */}
                  <img
                    src={CCC_LOGO}
                    alt="CCC Logo"
                    className="w-full h-full object-cover" 
                  />
                </button>
                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div 
                    className="absolute left-0 mt-2 w-64 bg-white rounded shadow-xl py-1 z-50 ring ring-black ring-opacity-5"
                    onMouseLeave={() => setIsProfileOpen(false)}
                  >
                    <div className="flex flex-row gap-1 py-1">
                      <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="ml-2 w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center hover:shadow-md transition-shadow"
                      >
                        {user.avatar ? (
                          <img 
                            src={`${API_URL}${user.avatar}`}
                            alt={user.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <span className="text-white font-bold text-base sm:text-lg">
                            {getInitials(user.name)}
                          </span>
                        )}
                        
                      </button>
                    
                    <div className="px-1">
                      <p className="text-sm font-medium text-gray-900">{profile.name || 'Instructor'}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{profile.email || 'No email'}</p>
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
              
              <div className="sm:block min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                  ProfLocator
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">Instructor Portal</p>
              </div>
            </div>

            {/* Right Side: Status Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all hover:shadow-md flex-shrink-0 ${currentStyle.bgColor} border-2 border-transparent hover:border-gray-200`}
            >
              <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${currentStyle.color} animate-pulse`}></div>
              <span className={`font-medium text-xs sm:text-sm ${currentStyle.textColor} whitespace-nowrap`}>
                {currentState.status}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Instructor Info Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
            
            {/* Left Side (Text Info) */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left w-full sm:w-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                {profile.name || 'Instructor Name'}
              </h2>
              <p className="text-sm sm:text-base text-gray-500 mb-3 sm:mb-4 truncate max-w-full">
                {profile.email || 'No email provided'}
              </p>
              {/* Location & Room */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 text-xs sm:text-sm w-full sm:w-auto">
                <div className="flex items-center justify-center sm:justify-start text-white rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 px-3 py-2 shadow-sm">
                  <Building className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{currentScheduleItem?.location || 'No location'}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start text-white rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 px-3 py-2 shadow-sm">
                  <DoorOpen className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{currentScheduleItem?.room || 'No room'}</span>
                </div>
              </div>
            </div>

            {/* Avatar */}
            {user.avatar ? (
              <img 
                src={`${API_URL}${user.avatar}`} 
                alt={user.name} 
                className="w-20 h-20 sm:w-16 sm:h-16 rounded-full object-cover" 
              />
            ) : (
              <div className="w-20 h-20 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl sm:text-xl font-bold shadow-lg flex-shrink-0">
              {getInitials(user.name)}
              </div>
            )}
            </div>
        </div>

        {/* Schedule Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Today's Schedule */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Today's Schedule
              </h3>
              <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {getTodaysDay()}s
              </span>
            </div>
            {todaysSchedule.length > 0 ? (
              <ul className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {todaysSchedule.map(item => (
                  <ScheduleItem key={item._id} item={item} />
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm font-medium">No classes scheduled today</p>
                <p className="text-gray-400 text-xs mt-1">Enjoy your day off!</p>
              </div>
            )}
          </div>

          {/* Full Schedule */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Full Schedule
            </h3>
            
            {/* Day Tabs with Scroll */}
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

                {/* Scrollable Day Tabs */}
                <div 
                  id="day-tabs-container"
                  className="flex-1 overflow-x-auto scrollbar-hide border-b border-gray-200"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <div className="flex space-x-1 min-w-max lg:min-w-0 lg:justify-start">
                    {scheduleDays.map(day => (
                      <button
                        key={day}
                        onClick={() => setSelectedScheduleDay(day)}
                        className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm rounded-t-lg whitespace-nowrap transition-colors flex-shrink-0 ${
                          selectedScheduleDay === day
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

            {/* Schedule List for Selected Day */}
            {selectedDaySchedule.length > 0 ? (
              <ul className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {selectedDaySchedule.map(item => (
                  <ScheduleItem key={item._id} item={item} />
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm font-medium">No classes on {selectedScheduleDay}</p>
                <p className="text-gray-400 text-xs mt-1">This day is free</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Status Override Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-gray-900/70 transition-opacity"
            onClick={() => setIsModalOpen(false)}
          ></div>

          {/* Modal */}
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Set Status Override</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Update your availability temporarily</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-2"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Status Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Status
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {statusOptions.map((status) => (
                      <button
                        key={status.value}
                        onClick={() => setSelectedStatus(status.value)}
                        className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                          selectedStatus === status.value
                            ? `${status.bgColor} ${status.textColor} border-current shadow-sm`
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${status.color} flex-shrink-0`}></div>
                          <span className={`font-medium text-xs sm:text-sm truncate ${
                            selectedStatus === status.value ? status.textColor : 'text-gray-700'
                          }`}>
                            {status.value}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Duration
                  </label>
                  <div className="space-y-2">
                    {durationOptions.map((duration) => (
                      <button
                        key={duration.value}
                        onClick={() => setSelectedDuration(duration.value)}
                        className={`w-full p-3 sm:p-4 rounded-lg border-2 transition-all text-left ${
                          selectedDuration === duration.value
                            ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                            : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                            <span className="font-medium text-sm sm:text-base truncate">{duration.label}</span>
                          </div>
                          {selectedDuration === duration.value && (
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-2 sm:space-x-3 p-4 sm:p-6 border-t border-gray-200">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSetStatus}
                  disabled={!selectedStatus || !selectedDuration}
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-medium rounded-lg transition-all ${
                    selectedStatus && selectedDuration
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Set Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default InstructorStatusDashboard;