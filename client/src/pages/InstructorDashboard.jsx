import React, { useState } from 'react';
import { X, Clock,DoorOpen , MapPin, Calendar } from 'lucide-react';
import { Building } from 'lucide-react';

import { useAuth } from '../context/AuthContext';


const InstructorStatusDashboard = () => {
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Mock instructor data
  const instructor = {
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@university.edu",
    currentStatus: "Available",
    location: "Science Building",
    room: "Room 301",
    statusOverrideExpires: null
  };

  const statusOptions = [
    { value: 'Available', color: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-50' },
    { value: 'In Class', color: 'bg-blue-500', textColor: 'text-blue-700', bgColor: 'bg-blue-50' },
    { value: 'In Meeting', color: 'bg-purple-500', textColor: 'text-purple-700', bgColor: 'bg-purple-50' },
    { value: 'Busy', color: 'bg-orange-500', textColor: 'text-orange-700', bgColor: 'bg-orange-50' },
    { value: 'Away', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgColor: 'bg-yellow-50' },
    { value: 'Unavailable', color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-50' }
  ];

  const durationOptions = [
    { label: '30 minutes', value: '30' },
    { label: '1 hour', value: '60' },
    { label: '2 hours', value: '120' },
    { label: 'Until EOD (5:00 PM)', value: 'eod' }
  ];

  const getCurrentStatusStyle = () => {
    return statusOptions.find(s => s.value === instructor.currentStatus) || statusOptions[0];
  };

  const handleSetStatus = () => {
    if (selectedStatus && selectedDuration) {
      console.log('Setting status:', selectedStatus, 'for duration:', selectedDuration);
      // This is where the API call will go
      setIsModalOpen(false);
      setSelectedDuration('');
      setSelectedStatus('');
    }
  };

  const currentStyle = getCurrentStatusStyle();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">{user.name}</span> {/* REPLACE THIS WITH FIRST LETTER OF THE USERS NAME */}
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900">InstruQuest</h1>
                <p className="text-xs text-gray-500">Instructor Portal</p>
              </div>
            </div>

            {/* Status Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all hover:shadow-md ${currentStyle.bgColor} border-2 border-transparent hover:border-gray-200`}
            >
              <div className={`w-3 h-3 rounded-full ${currentStyle.color} animate-pulse`}></div>
              <span className={`font-medium ${currentStyle.textColor}`}>
                {instructor.currentStatus}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Instructor Info Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">

          {/* Mobile = column ; Desktop = row */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">

            {/* Left Side (Text Info) */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">

              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {instructor.name}
              </h2>

              <p className="text-gray-500 mb-4">
                {instructor.email}
              </p>

              {/* Location & Room */}
              <div className="flex-row gap-3 text-sm">

                <button className="flex items-center text-white rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 p-2">
                  <Building className="w-4 h-4 mr-2" />
                  <span>{instructor.location}</span>
                </button>

                <button className="flex items-center text-white rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 p-2">
                  <DoorOpen className="w-4 h-4 mr-2" />
                  <span>{instructor.room}</span>
                </button>

              </div>
            </div>

            {/* Avatar — large on mobile, normal on desktop */}
            <div className="
              w-24 h-24 
              sm:w-16 sm:h-16
              bg-gradient-to-br from-blue-400 to-purple-500 
              rounded-full 
              flex items-center justify-center 
              text-white 
              text-3xl sm:text-xl 
              font-bold
            ">
              SJ {/* REPLACE THIS WITH FIRST LETTER OF THE USERS NAME */}
            </div>

          </div>
        </div>

        {/* Schedule Preview */}
        {/* !! TODO check the current date and if there is a schedule match for this user instructor to this day display it else display "No Schedule for today"*/}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Today's Schedule 
          </h3>
          <p className="text-gray-500 text-sm">Schedule view coming soon...</p>
        </div>

        {/* !! TODO display here the full schedule from database i.e from monday to friday"*/}
        {/* Full Schedule Preview */}
        <div className="mt-5 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Full Schedule
          </h3>
          <p className="text-gray-500 text-sm">Schedule Full view coming soon...</p>
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
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Set Status Override</h3>
                  <p className="text-sm text-gray-500 mt-1">Update your availability temporarily</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Status Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Status
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {statusOptions.map((status) => (
                      <button
                        key={status.value}
                        onClick={() => setSelectedStatus(status.value)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedStatus === status.value
                            ? `${status.bgColor} ${status.color} border-current`
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                          <span className={`font-medium text-sm ${
                            selectedStatus === status.value ? 'text-white' : 'text-gray-700'
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
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          selectedDuration === duration.value
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Clock className="w-5 h-5" />
                            <span className="font-medium">{duration.label}</span>
                          </div>
                          {selectedDuration === duration.value && (
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
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
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSetStatus}
                  disabled={!selectedStatus || !selectedDuration}
                  className={`px-6 py-2.5 font-medium rounded-lg transition-all ${
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
    </div>
  );
};

export default InstructorStatusDashboard;