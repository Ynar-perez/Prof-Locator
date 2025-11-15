import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

// 💡 We now accept the user's 'initialSchedule' and an 'onSubmit' function
const ScheduleModal = ({ user, onClose, onSubmit }) => {
  // State to hold the schedule entries
  const [schedule, setSchedule] = useState([]);
  const [error, setError] = useState('');

  // 💡 When the modal opens, populate the state with the user's existing schedule
  useEffect(() => {
    if (user && user.schedule) {
      setSchedule(user.schedule);
    }
  }, [user]);

  // --- Functions to manage the schedule state ---

  const handleAddEntry = () => {
    // Add a new blank entry
    const newEntry = {
      day: 'Monday',
      startTime: '09:00',
      endTime: '10:00',
      status: 'In Class'
    };
    setSchedule([...schedule, newEntry]);
  };

  const handleRemoveEntry = (indexToRemove) => {
    setSchedule(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleChangeEntry = (index, field, value) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[index][field] = value;
    setSchedule(updatedSchedule);
  };

  const handleSave = async () => {
    setError('');
    // Validate entries
    for (const entry of schedule) {
      if (entry.startTime >= entry.endTime) {
        setError(`Error in ${entry.day} entry: Start time must be before end time.`);
        return;
      }
    }

    try {
      // Call the parent's onSubmit function with the new schedule data
      await onSubmit(user._id, { schedule: schedule });
      onClose(); // Close modal on success
    } catch (err) {
      setError(err.message || 'Failed to save schedule.');
    }
  };

  const statusOptions = ['Available', 'In Class', 'In Meeting', 'Busy', 'Away', 'Unavailable'];
  const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-50 text-green-700 border-green-300 focus:ring-green-500';
      case 'In Class':
        return 'bg-blue-50 text-blue-700 border-blue-300 focus:ring-blue-500';
      case 'In Meeting':
        return 'bg-purple-50 text-purple-700 border-purple-300 focus:ring-purple-500';
      case 'Busy':
        return 'bg-red-50 text-red-700 border-red-300 focus:ring-red-500';
      case 'Away':
        return 'bg-yellow-50 text-yellow-700 border-yellow-300 focus:ring-yellow-500';
      case 'Unavailable':
        return 'bg-gray-100 text-gray-700 border-gray-300 focus:ring-gray-500';
      default:
        return 'border-gray-300 focus:ring-blue-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">Edit Schedule - {user.name}</h3>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Modal Body: Schedule List */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {error && <p className="text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>}
          
          {/* Header Row (This is hidden on mobile, which is correct) */}
          <div className="hidden md:grid grid-cols-12 gap-3 px-2 py-1 text-xs font-medium text-gray-500 uppercase">
            <span className="col-span-3">Day</span>
            <span className="col-span-3">Status</span>
            <span className="col-span-2">Start Time</span>
            <span className="col-span-2">End Time</span>
            <span className="col-span-2">Actions</span>
          </div>

          {schedule.length === 0 && (
            <p className="text-center text-gray-500 py-4">No schedule entries. Add one to get started.</p>
          )}

          {/* 💡 Schedule Entry Rows */}
          {schedule.map((entry, index) => (
            <div 
              key={index} 
              // 👇 Changed from grid-cols-1 to grid-cols-2 for mobile
              //    Added items-end to align the trash button with the inputs
              className="grid grid-cols-2 md:grid-cols-12 gap-3 p-3 bg-gray-50 rounded-lg items-end"
            >
              {/* Day */}
              {/* 👇 Wrapped in a div to handle col-span */}
              <div className="col-span-1 md:col-span-3">
                {/* 👇 Mobile-only label */}
                <label className="block text-xs font-medium text-gray-500 mb-1 md:hidden">Day</label>
                <select 
                  value={entry.day}
                  onChange={(e) => handleChangeEntry(index, 'day', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  {dayOptions.map(day => <option key={day} value={day}>{day}</option>)}
                </select>
              </div>

              {/* Status */}
              {/* 👇 Wrapped in a div to handle col-span */}
              <div className="col-span-1 md:col-span-3">
                {/* 👇 Mobile-only label */}
                <label className="block text-xs font-medium text-gray-500 mb-1 md:hidden">Status</label>
                <select 
                  value={entry.status}
                  onChange={(e) => handleChangeEntry(index, 'status', e.target.value)}
                  // 👇 Applied the dynamic color classes
                  className={`w-full px-3 py-2 border rounded-lg transition-colors ${getStatusColor(entry.status)}`}
                >
                  {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              {/* Start Time */}
              {/* 👇 Wrapped in a div to handle col-span */}
              <div className="col-span-1 md:col-span-2">
                {/* 👇 Mobile-only label (as requested) */}
                <label className="block text-xs font-medium text-gray-500 mb-1 md:hidden">Start Time</label>
                <input 
                  type="time" 
                  value={entry.startTime}
                  onChange={(e) => handleChangeEntry(index, 'startTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              
              {/* End Time */}
              {/* 👇 Wrapped in a div to handle col-span */}
              <div className="col-span-1 md:col-span-2">
                 {/* 👇 Mobile-only label (as requested) */}
                <label className="block text-xs font-medium text-gray-500 mb-1 md:hidden">End Time</label>
                <input 
                  type="time" 
                  value={entry.endTime}
                  onChange={(e) => handleChangeEntry(index, 'endTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>

              {/* Actions */}
              {/* 👇 Spans 2 cols on mobile to fill the row */}
              <div className="col-span-2 md:col-span-2 flex justify-end">
                <button 
                  onClick={() => handleRemoveEntry(index)}
                  // 👇 Set height to match inputs (py-2 + border = h-10)
                  className="p-2 h-10 text-red-600 hover:bg-red-100 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <button 
            onClick={handleAddEntry}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
          >
            <Plus className="w-4 h-4" />
            Add Time Block
          </button>
        </div>

        {/* Modal Footer: Action Buttons */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:from-blue-700 hover:to-violet-700 transition"
          >
            Save Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;