// ScheduleModal.jsx

import React from 'react';

// Destructure the required props:
// userName: The name of the user whose schedule is being edited.
// isVisible: Boolean to determine if the modal is shown (though fixed to 'true' in the usage below, it's good practice).
// onClose: The function to call when the modal should close (e.g., resetting state).
const ScheduleModal = ({ userName, onClose }) => {
  return (
    // Outer overlay/container
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200">
          {/* Use the 'userName' prop here */}
          <h3 className="text-xl font-bold text-gray-800">Schedule - {userName}</h3>
        </div>
        
        {/* Modal Body: Schedule List */}
        <div className="p-6">
          <div className="space-y-3">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
              <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-full sm:w-32 font-medium text-gray-700">{day}</div>
                <input type="time" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" defaultValue="09:00" />
                <span className="hidden sm:block text-gray-500">to</span>
                <input type="time" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" defaultValue="17:00" />
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer: Action Buttons */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose} // Use the 'onClose' prop here
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:from-blue-700 hover:to-violet-700 transition">
            Save Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;