import React, { useState, useEffect } from 'react';
import { Home, ClipboardList, BarChart3, Clock, Check, X, Users, Calendar, Loader2 } from 'lucide-react'; 

// --- Static Data and Configuration ---

// Backend API URL (Ensure your backend server is running on this port)
const API_URL = 'http://localhost:3001/api/attendance'; 

const SCREEN = {
  HOME: 'HOME',
  RECORD: 'RECORD',
  SUMMARY: 'SUMMARY',
};

// Dummy list of students
const DUMMY_STUDENTS = [
  { id: 's001', name: 'Alice Johnson' },
  { id: 's002', name: 'Bob Smith' },
  { id: 's003', name: 'Charlie Brown' },
  { id: 's004', name: 'Diana Prince' },
  { id: 's005', name: 'Evan Williams' },
];

const App = () => {
  const [currentScreen, setCurrentScreen] = useState(SCREEN.HOME);
  
  // Now stores the fetched array of records from the API
  const [attendanceRecords, setAttendanceRecords] = useState([]); 
  
  // State for recording a new session's attendance
  const [currentAttendance, setCurrentAttendance] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]); 
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- API Functions ---

  // 1. Fetch Records from Backend
  const fetchRecords = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch attendance data from the server.');
        }
        const data = await response.json();
        setAttendanceRecords(data);
    } catch (err) {
        setError(err.message);
        console.error('Fetch Error:', err);
    } finally {
        setIsLoading(false);
    }
  };
  
  // Fetch data immediately on component load
  useEffect(() => {
    fetchRecords();
  }, []); // Run only once on mount

  // --- Utility Functions ---

  const getAttendanceSummary = (studentId) => {
    let summary = { P: 0, A: 0, L: 0 }; 
    
    // Use the array of records fetched from the API
    attendanceRecords.forEach(record => {
      const status = record.attendanceData[studentId];
      if (status) {
        summary[status] = (summary[status] || 0) + 1;
      }
    });
    
    const totalDays = attendanceRecords.length;
    
    return {
      P: summary.P,
      A: summary.A,
      L: summary.L,
      Total: totalDays,
    };
  };

  const calculateTotalAttendance = (summary) => {
    return Math.round(((summary.P + summary.L) / (summary.Total || 1)) * 100);
  };
  
  // --- Attendance Actions ---

  const handleStatusChange = (studentId, status) => {
    setCurrentAttendance(prev => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // 2. Save Attendance to Backend
  const handleSaveAttendance = async () => {
    // Check local data to prevent saving if already exists (UI check)
    if (attendanceRecords.some(r => r.date === currentDate)) {
        setError("Attendance already recorded for this date. Please select a different date.");
        return;
    }
    
    if (Object.keys(currentAttendance).length < DUMMY_STUDENTS.length) {
        setError("Please mark attendance for all students before saving.");
        return;
    }

    setIsLoading(true);
    setError(null);

    const payload = { currentDate, currentAttendance };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
            // Check for duplicate date error specifically
            if (response.status === 409) {
                 throw new Error("Attendance for this date has already been recorded.");
            }
            throw new Error(result.message || 'Failed to save attendance.');
        }

        // Successfully saved, re-fetch all records to update the UI
        await fetchRecords(); 

        // Reset state and navigate
        setCurrentAttendance({});
        setCurrentDate(new Date().toISOString().split('T')[0]);
        setCurrentScreen(SCREEN.HOME);

    } catch (err) {
        setError(err.message);
        console.error('Save Error:', err);
    } finally {
        setIsLoading(false);
    }
  };

  const handleStartRecording = () => {
    setError(null);
    const initial = DUMMY_STUDENTS.reduce((acc, student) => {
        acc[student.id] = currentAttendance[student.id] || 'A'; 
        return acc;
    }, {});
    setCurrentAttendance(initial);
    setCurrentScreen(SCREEN.RECORD);
  };

  // --- Screen Renderers ---

  const renderLoading = () => (
    <div className="flex justify-center items-center min-h-screen bg-gray-950">
        <Loader2 className="w-8 h-8 text-green-400 animate-spin mr-2" />
        <span className="text-lg text-green-400">Loading data...</span>
    </div>
  );
  
  const renderError = () => (
    <div className="bg-red-900 border border-red-700 p-4 rounded-xl text-white mb-6 w-full max-w-xl">
      <p className="font-bold mb-2">Error!</p>
      <p>{error}</p>
      <button 
        className="mt-3 text-sm text-red-300 hover:text-red-100"
        onClick={() => {setError(null); fetchRecords();}}
      >
        Try Reloading Data
      </button>
    </div>
  );

  const renderHomeScreen = () => (
    <div className="flex flex-col items-center p-6 bg-gray-950 min-h-screen">
      <div className="w-full max-w-xl">
        <h1 className="text-3xl font-bold text-center text-green-300 mb-8 mt-4 flex items-center justify-center">
            <Users className="w-8 h-8 mr-3 text-green-400"/> Attendance Dashboard
        </h1>
        
        {error && renderError()}

        <div className="bg-gray-800 p-6 rounded-xl shadow-2xl mb-6 border border-green-600 shadow-green-900/50">
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-green-400"/> Today's Action (<span className="text-green-300">{new Date().toLocaleDateString()}</span>)
            </h2>
            <div className='flex gap-4'>
                <button 
                  className="w-1/2 p-3 font-semibold text-gray-900 bg-green-400 rounded-lg shadow-md hover:bg-green-500 transition-colors flex items-center justify-center" 
                  onClick={handleStartRecording}
                  disabled={isLoading}
                >
                  <ClipboardList className="w-5 h-5 mr-2"/> Record Attendance
                </button>
                <button 
                  className="w-1/2 p-3 font-semibold text-white bg-gray-700 rounded-lg shadow-md hover:bg-gray-600 transition-colors flex items-center justify-center" 
                  onClick={() => setCurrentScreen(SCREEN.SUMMARY)}
                  disabled={isLoading}
                >
                   <BarChart3 className="w-5 h-5 mr-2"/> View Summary
                </button>
            </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-3">Attendance History</h2>
            {isLoading ? renderLoading() : (
                <>
                <p className="text-sm text-green-400 mb-4">{attendanceRecords.length} Days Recorded</p>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {attendanceRecords.length === 0 ? (
                        <p className="text-gray-400 italic">No attendance records found.</p>
                    ) : (
                        attendanceRecords.map(record => (
                            <div key={record.date} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg border border-gray-600 hover:bg-gray-600 transition-colors cursor-pointer">
                                <span className="font-medium text-gray-200">{new Date(record.date).toLocaleDateString()}</span>
                                <span className="text-sm text-green-400 flex items-center">
                                    <Users className="w-4 h-4 mr-1"/> {Object.keys(record.attendanceData).length} Students
                                </span>
                            </div>
                        ))
                    )}
                </div>
                </>
            )}
        </div>
      </div>
    </div>
  );

  const renderRecordScreen = () => (
    <div className="flex flex-col items-center p-6 bg-gray-950 min-h-screen">
      <div className="w-full max-w-xl">
        <h1 className="text-3xl font-bold text-green-300 mb-6 mt-4 text-center">Record Attendance</h1>
        
        {error && renderError()}

        <div className="bg-gray-800 p-5 rounded-xl shadow-lg mb-6 border border-green-600">
            <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">Select Date</label>
            <input
              type="date"
              id="date"
              className="w-full p-3 mb-4 text-sm border border-green-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-700 text-white"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
            />
        </div>

        <div className="space-y-3 pb-20">
          {DUMMY_STUDENTS.map((student) => {
            const status = currentAttendance[student.id] || 'A';
            return (
              <div key={student.id} className="p-4 bg-gray-800 rounded-xl shadow-md flex justify-between items-center border-l-4 border-green-500">
                <span className="text-lg font-semibold text-white">{student.name}</span>
                <div className="flex space-x-2">
                  <button 
                    title="Present"
                    className={`p-2 rounded-full text-sm font-medium transition-colors ${status === 'P' ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-green-800 hover:text-white'}`}
                    onClick={() => handleStatusChange(student.id, 'P')}
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button 
                    title="Absent"
                    className={`p-2 rounded-full text-sm font-medium transition-colors ${status === 'A' ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-red-800 hover:text-white'}`}
                    onClick={() => handleStatusChange(student.id, 'A')}
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <button 
                    title="Late"
                    className={`p-2 rounded-full text-sm font-medium transition-colors ${status === 'L' ? 'bg-yellow-500 text-gray-900 shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-yellow-800 hover:text-gray-900'}`}
                    onClick={() => handleStatusChange(student.id, 'L')}
                  >
                    <Clock className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Fixed bottom navigation for actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex justify-between p-4 shadow-2xl">
        <button 
          className="p-3 font-semibold text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors flex items-center" 
          onClick={() => setCurrentScreen(SCREEN.HOME)}
          disabled={isLoading}
        >
          <X className="w-5 h-5 mr-2"/> Cancel
        </button>
        <button 
          className="p-3 font-semibold text-gray-900 bg-green-400 rounded-lg hover:bg-green-500 transition-colors flex items-center" 
          onClick={handleSaveAttendance}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin"/> : <Check className="w-5 h-5 mr-2"/>} 
          {isLoading ? 'Saving...' : 'Save Attendance'}
        </button>
      </div>
    </div>
  );

  const renderSummaryScreen = () => (
    <div className="flex flex-col items-center p-6 bg-gray-950 min-h-screen">
      <div className="w-full max-w-xl">
        <h1 className="text-3xl font-bold text-green-300 mb-8 mt-4 text-center">Summary Report</h1>
        
        <div className="bg-green-700 text-white p-6 rounded-xl shadow-lg mb-6 flex justify-between items-center border border-green-600 shadow-green-900/50">
            <div>
                <p className="text-sm font-medium opacity-80">Total Days Tracked</p>
                <p className="text-4xl font-extrabold">{attendanceRecords.length}</p>
            </div>
            <BarChart3 className="w-10 h-10 opacity-70"/>
        </div>

        {error && renderError()}

        {isLoading ? renderLoading() : (
            <div className="space-y-4 pb-20">
              {DUMMY_STUDENTS.map((student) => {
                const summary = getAttendanceSummary(student.id);
                const percentage = calculateTotalAttendance(summary);
                
                return (
                  <div key={student.id} className="p-5 bg-gray-800 rounded-xl shadow-md border-l-4 border-green-500">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-xl font-semibold text-white">{student.name}</h2>
                        <span className={`text-2xl font-bold ${percentage >= 80 ? 'text-green-400' : percentage >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {percentage}%
                        </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                        <span>P: <span className="font-bold text-green-400">{summary.P}</span></span>
                        <span>L: <span className="font-bold text-yellow-400">{summary.L}</span></span>
                        <span>A: <span className="font-bold text-red-400">{summary.A}</span></span>
                        <span>Total: <span className="font-bold text-green-400">{summary.Total}</span></span>
                    </div>
                  </div>
                );
              })}
            </div>
        )}
      </div>
      
      {/* Fixed bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex justify-center p-4 shadow-2xl">
        <button 
          className="p-3 font-semibold text-gray-900 bg-green-400 rounded-lg hover:bg-green-500 transition-colors w-1/2 max-w-xs flex items-center justify-center" 
          onClick={() => setCurrentScreen(SCREEN.HOME)}
          disabled={isLoading}
        >
          <Home className="w-5 h-5 mr-2"/> Go to Dashboard
        </button>
      </div>
    </div>
  );

  const renderScreen = () => {
    // If the error exists and we are not loading, show the error overlay on top of the current screen content.
    if (isLoading && currentScreen !== SCREEN.RECORD) {
        return renderLoading();
    }
    
    switch (currentScreen) {
      case SCREEN.RECORD:
        return renderRecordScreen();
      case SCREEN.SUMMARY:
        return renderSummaryScreen();
      case SCREEN.HOME:
      default:
        return renderHomeScreen();
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 font-sans antialiased">
        {renderScreen()}
    </div>
  );
};

export default App;
