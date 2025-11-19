import React, { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";

// Simple icons (Inline SVGs to avoid dependency issues)
const PrinterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 6 2 18 2 18 9"></polyline>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
    <rect x="6" y="14" width="12" height="8"></rect>
  </svg>
);
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const AdminReports = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Report configuration
  const [groupBy, setGroupBy] = useState("instructor"); // 'instructor' or 'day'
  const [layout, setLayout] = useState("one-per-page"); // 'one-per-page' or 'compact'
  const [showAvailable, setShowAvailable] = useState(true);

  const printRef = useRef();

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const token = localStorage.getItem("token");
      // NOTE: Ensure this endpoint path matches your backend exactly
      const response = await fetch("/api/users/instructors", {
        headers: { "x-auth-token": token },
      });

      if (!response.ok) throw new Error("Failed to fetch instructors");

      const data = await response.json();
      setInstructors(data);
      // Default: select no one initially, or select all depending on preference
      setSelectedInstructors(data.map((inst) => inst._id));
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const groupScheduleByDay = (baseSchedule) => {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const grouped = {};
    days.forEach((day) => {
      grouped[day] = baseSchedule
        .filter((item) => item.day === day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return grouped;
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef, // Use contentRef for better stability in newer versions
    documentTitle: `Schedule_Report_${new Date().toISOString().split("T")[0]}`,
    onAfterPrint: () => console.log("Print finished"),
    onPrintError: (error) => console.error("Print failed:", error),
  });

  const toggleInstructor = (id) => {
    setSelectedInstructors((prev) =>
      prev.includes(id) ? prev.filter((instId) => instId !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    const visibleIDs = getVisibleInstructors().map((i) => i._id);
    const allSelected = visibleIDs.every((id) =>
      selectedInstructors.includes(id)
    );

    if (allSelected) {
      setSelectedInstructors((prev) =>
        prev.filter((id) => !visibleIDs.includes(id))
      );
    } else {
      setSelectedInstructors((prev) => [...new Set([...prev, ...visibleIDs])]);
    }
  };

  const getVisibleInstructors = () => {
    return instructors.filter((inst) =>
      inst.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Get the actual data to render/print
  const filteredInstructors = instructors
    .filter((inst) => selectedInstructors.includes(inst._id))
    .sort((a, b) => a.name.localeCompare(b.name));

  const groupAllByDay = () => {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const grouped = {};

    days.forEach((day) => {
      grouped[day] = [];
      filteredInstructors.forEach((instructor) => {
        const daySchedule = (instructor.baseSchedule || [])
          .filter((item) => item.day === day)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));

        if (daySchedule.length > 0) {
          grouped[day].push({
            instructor: instructor.name,
            email: instructor.email,
            schedule: daySchedule,
          });
        }
      });
    });
    return grouped;
  };

  // --- Render Logic for Print ---
  const renderPrintContent = () => {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    // Helper for consistent styling across views
    // "p-4" is a small 1rem safety padding so text doesn't hit the absolute paper edge.
    const pageContainerClass = "page-break w-full bg-white p-4 mb-0";

    if (groupBy === "instructor") {
      if (layout === "one-per-page") {
        // DETAIL VIEW
        return filteredInstructors.map((instructor, idx) => {
          const scheduleByDay = groupScheduleByDay(
            instructor.baseSchedule || []
          );
          return (
            <div key={instructor._id} className={pageContainerClass}>
              {/* Header: Border bottom for separation, but minimal spacing */}
              <div className="border-b-2 border-gray-800 pb-2 mb-4 flex justify-between items-end">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide leading-tight">
                    {instructor.name}
                  </h1>
                  <p className="text-sm text-gray-600">{instructor.email}</p>
                </div>

                <div className="text-sm text-gray-500">
                  <p>Generated: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid gap-4">
                {days.map((day) => {
                  const daySchedule = scheduleByDay[day];
                  if (!daySchedule || daySchedule.length === 0) return null;

                  // --- UPDATED FILTER: Only "In Class" ---
                  const inClassItems = daySchedule.filter(
                    (item) => item.status === "In Class"
                  );

                  // --- UPDATED FILTER: Only "Available" ---
                  const availableItems = showAvailable
                    ? daySchedule.filter((item) => item.status === "Available")
                    : [];

                  if (inClassItems.length === 0 && availableItems.length === 0)
                    return null;

                  return (
                    <div
                      key={day}
                      className="border border-gray-200 rounded overflow-hidden break-inside-avoid"
                    >
                      {/* Smaller header for the day */}
                      <div className="bg-gray-100 px-3 py-1.5 border-b border-gray-200 font-bold text-gray-700 text-sm">
                        {day}
                      </div>
                      <div className="p-2 grid gap-2">
                        {inClassItems.length > 0 && (
                          <div className="space-y-1">
                            {inClassItems.map((item, i) => (
                              <div
                                key={i}
                                className="flex justify-between text-sm border-l-4 border-blue-500 bg-blue-50 px-2 py-1"
                              >
                                <span className="font-bold">
                                  {formatTime(item.startTime)} -{" "}
                                  {formatTime(item.endTime)}
                                </span>
                                <span className="flex-1 text-center font-medium text-xs">
                                  {item.status}
                                </span>
                                <span className="text-gray-700 text-xs flex items-center">
                                  {item.room} ({item.location})
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        {availableItems.length > 0 && (
                          <div className="space-y-1">
                            {availableItems.map((item, i) => (
                              <div
                                key={i}
                                className="flex justify-between text-sm border-l-4 border-green-500 bg-green-50 px-2 py-1"
                              >
                                <span className="font-bold">
                                  {formatTime(item.startTime)} -{" "}
                                  {formatTime(item.endTime)}
                                </span>
                                <span className="flex-1 text-center font-medium text-xs">
                                  {item.status}
                                </span>
                                <span className="text-gray-700 text-xs flex items-center">
                                  {item.room || item.location || "Faculty Room"}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        });
      } else {
        // COMPACT VIEW
        return (
          // Use p-4 instead of p-8 to maximize space
          <div className="p-4 bg-white min-h-full">
            <div className="border-b-2 border-gray-800 pb-2 mb-4 text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Instructor Schedule Summary
              </h1>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {filteredInstructors.map((instructor) => {
                const scheduleByDay = groupScheduleByDay(
                  instructor.baseSchedule || []
                );

                // Check if there are any "In Class" items before rendering the card
                const hasSchedule = Object.values(scheduleByDay).some((day) =>
                  day.some((item) => item.status === "In Class")
                );
                if (!hasSchedule) return null;

                return (
                  <div
                    key={instructor._id}
                    className="border border-gray-300 rounded p-3 break-inside-avoid shadow-sm"
                  >
                    <h2 className="font-bold text-base text-blue-800 border-b pb-1 mb-2">
                      {instructor.name}
                    </h2>
                    {days.map((day) => {
                      // --- UPDATED FILTER: Only "In Class" ---
                      const activeItems =
                        scheduleByDay[day]?.filter(
                          (item) => item.status === "In Class"
                        ) || [];
                      if (activeItems.length === 0) return null;
                      return (
                        <div key={day} className="mb-1 text-xs">
                          <span className="font-semibold w-20 inline-block text-gray-600">
                            {day}:
                          </span>
                          <div className="pl-1 border-l-2 border-gray-300 inline-block align-top">
                            {activeItems.map((item, i) => (
                              <div key={i} className="block">
                                <span>
                                  {formatTime(item.startTime)} -{" "}
                                  {formatTime(item.endTime)} ({item.room})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
    } else {
      // GROUP BY DAY
      const groupedByDay = groupAllByDay();
      return days.map((day) => {
        const rawDayData = groupedByDay[day];
        if (!rawDayData || rawDayData.length === 0) return null;

        // --- UPDATED FILTER: Filter out unwanted statuses BEFORE rendering ---
        // This ensures we don't print an instructor name if their valid classes are all filtered out
        const dayData = rawDayData
          .map((instructorItem) => {
            const filteredSchedule = instructorItem.schedule.filter((item) => {
              const isAvailable = item.status === "Available" && showAvailable;
              const isInClass = item.status === "In Class";
              return isAvailable || isInClass;
            });

            return {
              ...instructorItem,
              schedule: filteredSchedule,
            };
          })
          .filter((instructorItem) => instructorItem.schedule.length > 0); // Remove instructors with empty schedules after filtering

        if (dayData.length === 0) return null;

        return (
          <div key={day} className={pageContainerClass}>
            <div className="flex items-center justify-between border-b-4 border-blue-600 pb-2 mb-4">
              <h1 className="text-3xl font-bold text-gray-800">{day}</h1>
              <div className="text-sm text-gray-500">
                <p>Generated: {new Date().toLocaleDateString()}</p>
              </div>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                {dayData.length} Instructors
              </span>
            </div>

            <div className="space-y-4">
              {dayData.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col md:flex-row border-b border-gray-200 pb-2 break-inside-avoid"
                >
                  <div className="md:w-1/4 mb-1 md:mb-0">
                    <h3 className="font-bold text-base">{item.instructor}</h3>
                  </div>
                  <div className="md:w-3/4 space-y-1">
                    {item.schedule.map((s, i) => (
                      <div
                        key={i}
                        className={`flex justify-between px-2 py-1 rounded text-sm ${
                          s.status === "Available"
                            ? "bg-green-50 text-green-800"
                            : "bg-blue-50 text-blue-900 border-l-4 border-blue-500" // Changed styling slightly to distinguish "In Class"
                        }`}
                      >
                        <span className="font-medium w-33">
                          {formatTime(s.startTime)} - {formatTime(s.endTime)}
                        </span>
                        <span className="flex-1 text-center font-medium text-xs">
                          {s.status}
                        </span>
                        <span className="w-32 text-right text-gray-600 text-xs">
                          {s.room || s.location}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      });
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded">
        Error: {error}
      </div>
    );

  return (
    <div className="">
      {/* Header & Controls (Keep as is) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 print:hidden">
        {/* ... (Keep your existing header/search/buttons code here) ... */}
        {/* Just showing the wrapper structure for context */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          {/* Text Section: Centered on mobile, Left-aligned on Tablet+ */}
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-800">Print Report</h2>
            <p className="text-gray-500 text-sm mt-1">
              Select instructors to print schedules
            </p>
          </div>

          {/* Button: Full width on mobile, Auto width on Tablet+ */}
          <button
            onClick={() => {
              if (selectedInstructors.length === 0) {
                alert("Please select at least one instructor first.");
                return;
              }
              handlePrint();
            }}
            disabled={loading || selectedInstructors.length === 0}
            className={`
              flex items-center justify-center gap-2 px-6 py-3 rounded-lg 
              text-white shadow-sm font-medium transition-colors 
              w-full sm:w-auto 
              ${
                selectedInstructors.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }
            `}
          >
            <PrinterIcon />
            Download PDF
          </button>
        </div>

        {/* (Keep the search and config inputs here) */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Instructor list... */}
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-700">
                Select Instructors
              </h3>
              <button
                onClick={toggleAll}
                className="text-xs text-blue-600 hover:underline"
              >
                {getVisibleInstructors().every((i) =>
                  selectedInstructors.includes(i._id)
                )
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>
            {/* Search Input... */}
            <input
              type="text"
              placeholder="Search..."
              className="w-full border rounded p-2 mb-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-35 lg:max-h-25 overflow-y-auto p-2 border rounded bg-gray-50">
              {getVisibleInstructors().map((inst) => (
                <label
                  key={inst._id}
                  className="flex items-center space-x-2 p-1 hover:bg-white rounded cursor-pointer"
                >
                  <input
                    className="accent-blue-600"
                    type="checkbox"
                    checked={selectedInstructors.includes(inst._id)}
                    onChange={() => toggleInstructor(inst._id)}
                  />
                  <span className="text-sm truncate">{inst.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Settings</h3>
            {/* Settings... */}
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="w-full mb-2 p-2 border rounded"
            >
              <option value="instructor">By Instructor</option>
              <option value="day">By Day</option>
            </select>
            {groupBy === "instructor" && (
              <select
                value={layout}
                onChange={(e) => setLayout(e.target.value)}
                className="w-full mb-2 p-2 border rounded"
              >
                <option value="one-per-page">Detailed</option>
                <option value="compact">Compact</option>
              </select>
            )}
            <label className="flex items-center space-x-2">
              <input
                className="accent-blue-600"
                type="checkbox"
                checked={showAvailable}
                onChange={(e) => setShowAvailable(e.target.checked)}
              />
              <span className="text-sm">Show Available</span>
            </label>
          </div>
        </div>
      </div>

      {/* PRINT PREVIEW AREA - UPDATED */}
      <div className="bg-gray-300 p-4 md:p-8 rounded-xl overflow-auto flex justify-center">
        <div className="print-preview-wrapper shadow-2xl">
          <div
            ref={printRef}
            className="print-content bg-white text-gray-900 w-[210mm] min-h-[297mm] mx-auto origin-top"
          >
            {selectedInstructors.length > 0 ? (
              renderPrintContent()
            ) : (
              <div className="p-10 text-center text-gray-400 italic">
                Select instructors to preview
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PRINT CSS */}
      <style>{`
        /* Ensure background colors print */
        @media print {
          @page {
            margin: 0mm; 
            size: auto;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background-color: white;
          }
          
          .print\\:hidden { display: none !important; }

          /* Reset container styles for print */
          .print-content {
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important; /* No forced padding on the paper edge */
            overflow: visible !important;
          }

          /* Ensure pages break cleanly */
          .page-break {
            page-break-after: always;
            break-after: page;
            padding: 0.5cm !important; 
          }

          .break-inside-avoid {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminReports;