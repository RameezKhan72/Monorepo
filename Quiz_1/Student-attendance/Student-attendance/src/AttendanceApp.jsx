import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';
import { getFirestore, doc, setDoc, collection, query, onSnapshot, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';
import { User, Calendar, Plus, CheckCircle, XCircle, Loader2, Save } from 'lucide-react';

// --- CONFIGURATION ---
// These variables are provided by the embedding environment
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-attendance-app';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
// --- END CONFIGURATION ---

// Utility function to format date as YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

// Custom Hook for Firebase Initialization and Authentication
const useFirebase = () => {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!firebaseConfig || Object.keys(firebaseConfig).length === 0) {
        console.error("Firebase configuration is missing.");
        return;
    }

    try {
        const app = initializeApp(firebaseConfig);
        const firestore = getFirestore(app);
        const firebaseAuth = getAuth(app);

        setDb(firestore);
        setAuth(firebaseAuth);

        const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                // Sign in anonymously if no custom token is provided or after sign-out
                try {
                  if (initialAuthToken) {
                      await signInWithCustomToken(firebaseAuth, initialAuthToken);
                  } else {
                      const anonUser = await signInAnonymously(firebaseAuth);
                      setUserId(anonUser.user.uid);
                  }
                } catch (e) {
                  // Fallback to random ID if auth fails entirely
                  console.error("Firebase Auth failed, using random ID.", e);
                  setUserId(crypto.randomUUID());
                }
            }
            setIsReady(true);
        });

        return () => unsubscribe();
    } catch (error) {
        console.error("Error initializing Firebase:", error);
    }
  }, []);

  return { db, auth, userId, isReady };
};

// Helper component for loading state
const Loading = () => (
  <div className="flex flex-col items-center justify-center p-8 bg-white/70 backdrop-blur-sm rounded-xl shadow-xl">
    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
    <p className="mt-4 text-gray-700 font-medium">Loading Attendance App...</p>
  </div>
);

// Main Application Component
const AttendanceApp = () => {
  const { db, userId, isReady } = useFirebase();
  
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({}); // { studentId: 'P' | 'A' }
  const [currentDate, setCurrentDate] = useState(formatDate(new Date()));
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  // Firestore path references
  // Students are public data so they can be managed collaboratively
  const STUDENTS_PATH = useMemo(() => `/artifacts/${appId}/public/data/students`, [appId]);
  const ATTENDANCE_PATH = useMemo(() => `/artifacts/${appId}/public/data/dailyAttendance`, [appId]);

  // 1. Fetch Students
  useEffect(() => {
    if (!isReady || !db) return;

    setIsLoadingData(true);
    const q = query(collection(db, STUDENTS_PATH));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studentList = [];
      snapshot.forEach((doc) => {
        studentList.push({ id: doc.id, ...doc.data() });
      });
      // Sort students by name
      studentList.sort((a, b) => a.name.localeCompare(b.name));
      setStudents(studentList);
      setIsLoadingData(false);
    }, (error) => {
      console.error("Error listening to students:", error);
      setIsLoadingData(false);
    });

    return () => unsubscribe();
  }, [isReady, db, STUDENTS_PATH]);

  // 2. Fetch Attendance for Selected Date
  const fetchAttendanceForDate = useCallback(async (date) => {
    if (!db || students.length === 0) return;
    
    setIsLoadingData(true);
    setAttendanceRecords({});
    
    try {
      const docRef = doc(db, ATTENDANCE_PATH, date);
      const docSnap = await getDoc(docRef);

      let fetchedRecords = {};
      if (docSnap.exists() && docSnap.data().records) {
        fetchedRecords = docSnap.data().records;
      } 
      
      // Initialize records for all known students
      const newRecords = students.reduce((acc, student) => {
          // Keep fetched status if available, otherwise default to 'Absent' (A)
          acc[student.id] = fetchedRecords[student.id] || 'A';
          return acc;
      }, {});
      
      setAttendanceRecords(newRecords);
      
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setIsLoadingData(false);
    }
  }, [db, ATTENDANCE_PATH, students]);
  
  // Trigger fetch when date changes OR when student list loads/changes
  useEffect(() => {
    if (db && students.length > 0) {
      fetchAttendanceForDate(currentDate);
    } else if (students.length === 0 && isReady) {
      // Still set loading to false if no students are found but the app is ready
      setIsLoadingData(false);
    }
  }, [currentDate, students.length, fetchAttendanceForDate, db, isReady]);

  // Handle date change and refresh attendance
  const handleDateChange = (e) => {
    setCurrentDate(e.target.value);
  };
  
  // Toggle attendance status for a single student
  const toggleAttendance = (studentId) => {
    setAttendanceRecords(prevRecords => ({
      ...prevRecords,
      [studentId]: prevRecords[studentId] === 'P' ? 'A' : 'P'
    }));
  };

  // Save the current attendance state to Firestore
  const saveAttendance = async () => {
    if (!db || students.length === 0) return;
    setIsSaving(true);
    
    try {
      const docRef = doc(db, ATTENDANCE_PATH, currentDate);
      
      await setDoc(docRef, {
        date: currentDate,
        records: attendanceRecords,
        lastUpdatedBy: userId,
        lastUpdated: new Date().toISOString(),
      }, { merge: true }); // Use merge to avoid overwriting the whole document if other fields are present

      console.log("Attendance successfully saved for:", currentDate);
    } catch (error) {
      console.error("Error saving attendance:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Add Student Logic
  const AddStudentModal = () => {
    const [name, setName] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAddStudent = async () => {
      if (!db || name.trim() === '') return;
      setIsAdding(true);

      try {
        const studentsColRef = collection(db, STUDENTS_PATH);
        
        // Firestore will generate a unique ID for the student document
        await setDoc(doc(studentsColRef, crypto.randomUUID()), {
          name: name.trim(),
          addedBy: userId,
          addedOn: new Date().toISOString(),
        });
        
        setName('');
        setShowAddStudentModal(false);
      } catch (error) {
        console.error("Error adding student:", error);
      } finally {
        setIsAdding(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Student</h3>
          
          <input
            type="text"
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            placeholder="Student Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isAdding}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && name.trim() !== '' && !isAdding) {
                handleAddStudent();
              }
            }}
          />

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowAddStudentModal(false)}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-150"
              disabled={isAdding}
            >
              Cancel
            </button>
            <button
              onClick={handleAddStudent}
              className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition duration-150 disabled:opacity-50 flex items-center"
              disabled={isAdding || name.trim() === ''}
            >
              {isAdding ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Plus className="w-5 h-5 mr-2" />}
              {isAdding ? 'Adding...' : 'Add Student'}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Main Render
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-8">
      
      {showAddStudentModal && <AddStudentModal />}

      <header className="mb-8 p-4 bg-white shadow-lg rounded-xl">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-3xl font-extrabold text-indigo-700 mb-4 sm:mb-0">
            Class Attendance Manager
          </h1>
          <div className="text-sm text-gray-600 flex items-center p-2 bg-indigo-50 rounded-lg">
            <User className="w-4 h-4 mr-2 text-indigo-500" />
            <span className='truncate w-40'>{userId || 'Anonymous User'}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
          
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Calendar className="w-6 h-6 text-gray-500" />
            <label htmlFor="date-picker" className="text-gray-700 font-medium whitespace-nowrap">
              Date:
            </label>
            <input
              id="date-picker"
              type="date"
              value={currentDate}
              onChange={handleDateChange}
              className="p-2 border border-indigo-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            />
          </div>

          <div className="flex space-x-4 w-full sm:w-auto">
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="flex items-center justify-center w-1/2 sm:w-auto px-4 py-2 text-white bg-green-500 rounded-lg shadow-md hover:bg-green-600 transition duration-150 disabled:opacity-50"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Student
            </button>
            <button
              onClick={saveAttendance}
              className="flex items-center justify-center w-1/2 sm:w-auto px-4 py-2 text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 disabled:opacity-50"
              disabled={isSaving || isLoadingData || students.length === 0}
            >
              {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
              {isSaving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>

        {students.length === 0 && !isLoadingData ? (
          <div className="text-center p-10 bg-white rounded-xl shadow-lg">
            <p className="text-lg text-gray-500">No students found for this app. Click "Add Student" to begin.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                    Attendance Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {isLoadingData ? (
                   <tr>
                    <td colSpan="3" className="text-center py-6 text-indigo-500">
                      <Loader2 className="w-6 h-6 mx-auto animate-spin" />
                      <p>Loading students and attendance...</p>
                    </td>
                  </tr>
                ) : (
                    students.map((student, index) => {
                      // Ensure student ID exists in records, default to Absent ('A')
                      const status = attendanceRecords[student.id] || 'A';
                      const isPresent = status === 'P';

                      return (
                        <tr key={student.id} className="hover:bg-gray-50 transition duration-100">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {student.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => toggleAttendance(student.id)}
                              className={`
                                flex items-center justify-center mx-auto px-3 py-1.5 rounded-full text-sm font-medium transition duration-200 shadow-md
                                ${isPresent 
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                                }
                              `}
                            >
                              {isPresent 
                                ? <><CheckCircle className="w-4 h-4 mr-2" /> Present</> 
                                : <><XCircle className="w-4 h-4 mr-2" /> Absent</>
                              }
                            </button>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AttendanceApp;
