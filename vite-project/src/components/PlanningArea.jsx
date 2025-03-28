import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { AiOutlineQrcode } from 'react-icons/ai';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth } from '../config/firebaseconfig';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Timer } from 'lucide-react';
import FocusZoneComponent from './FocusZoneComponent'; 


const PlanningArea = () => {
  const [taskTitle, setTaskTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [time, setTime] = useState(''); // UI remains unchanged; however, this value won't be stored in Firestore.
  const [priority, setPriority] = useState('');
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState([]);
  const [quote, setQuote] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isInFocusMode, setIsInFocusMode] = useState(false);
  const [qrCodeData, setQRCodeData] = useState('');

  // -------------- FETCH TASKS & QUOTE --------------
 useEffect(() => {
  fetchRandomQuote();
  fetchUserTasks();
}, []);

  // ---- Fetch tasks for the logged-in user only ----
  const fetchUserTasks = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return; // Ensure user is logged in

      const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const fetchedTasks = querySnapshot.docs.map((docRef) => ({
        id: docRef.id,
        ...docRef.data(),
      }));

      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error fetching user tasks:', error);
    }
  };

const fetchRandomQuote = () => {
  const MOTIVATIONAL_QUOTES = [
    {
      content: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill"
    },
    {
      content: "Believe you can and you're halfway there.",
      author: "Theodore Roosevelt"
    },
    {
      content: "The only way to do great work is to love what you do.",
      author: "Steve Jobs"
    }
  ];

  const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  setQuote(MOTIVATIONAL_QUOTES[randomIndex]);
};

  // -------------- ADD TASK --------------
  const handleAddTask = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return; // Ensure user is logged in

    // Create a new task with dueDate as a Firestore timestamp and store userId.
    const newTask = {
      title: taskTitle,
      description,
      priority,
      dueDate: new Date(dueDate), // Firestore stores timestamps
      createdAt: new Date(),
      status: 'Pending',
      userId: user.uid,
    };

    // Reset form values (time is not stored, but left here for UI consistency)
    setTaskTitle('');
    setDueDate('');
    setTime('');
    setPriority('');
    setDescription('');

    try {
      const docRef = await addDoc(collection(db, 'tasks'), newTask);
      setTasks([...tasks, { ...newTask, id: docRef.id }]);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  // -------------- COMPLETE (DELETE) TASK --------------
  const handleCompleteTask = async (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // -------------- QR CODE LOGIC --------------
  const handleGenerateQR = () => {
    const today = new Date().toDateString();
    const todayTasks = tasks.filter((task) => {
      let taskDueDate;
      // Handle Firestore Timestamp or Date string
      if (task.dueDate && typeof task.dueDate === 'object' && task.dueDate.toDate) {
        taskDueDate = task.dueDate.toDate();
      } else {
        taskDueDate = new Date(task.dueDate);
      }
      return taskDueDate.toDateString() === today;
    });

    // Convert tasks to a readable, formatted string (time is excluded)
    const qrData = todayTasks
      .map(
        (task) => `Title: ${task.title}
Date: ${new Date(task.dueDate).toDateString()}
Priority: ${task.priority}
${task.description ? `Description: ${task.description}` : ''}
---`.trim()
      )
      .join('\n\n');

    setQRCodeData(qrData);
    setShowQRModal(true);
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'tasks_qr_code';
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  const priorityColors = {
    low: 'bg-green-50 text-green-700 border-green-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    high: 'bg-red-50 text-red-700 border-red-200',
  };

  // -------------- SIGN OUT --------------
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Optionally redirect or do something else after sign out
      // e.g., window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // ------------------- UI STARTS HERE (NO CHANGES) -------------------
  return (
    <>
     {isInFocusMode ? (
      <FocusZoneComponent onExit={() => setIsInFocusMode(false)} />
    ) : (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-[#4361ee] py-10">
        <div className="container mx-auto px-4 max-w-6xl">
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-purple-500 mb-3 tracking-tight">
            HUSTLEHUB
          </h1>
          <p className="text-2xl text-black font-medium">
            Your go to space for organized hustle
          </p>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Task Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white shadow-xl rounded-2xl p-8 border border-indigo-100/50 hover:shadow-2xl transition-all duration-300"
          >
            <h2 className="text-2xl font-bold text-indigo-700 mb-6">Add New Task</h2>
            <form onSubmit={handleAddTask} className="space-y-5">
              <input
                type="text"
                placeholder="Task Title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full border-2 border-indigo-100 p-3 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all"
                required
              />
              <div className="flex space-x-4">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-1/2 border-2 border-indigo-100 p-3 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
                  required
                />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-1/2 border-2 border-indigo-100 p-3 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
                  required
                />
              </div>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border-2 border-indigo-100 p-3 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
                required
              >
                <option value="">Select Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <textarea
                placeholder="Description (Optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border-2 border-indigo-100 p-3 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
                rows="3"
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Add Task
              </button>
            </form>
          </motion.div>

          {/* Tasks List Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white shadow-xl rounded-2xl p-8 border border-indigo-100/50 hover:shadow-2xl transition-all duration-300 relative"
          >
            <h2 className="text-2xl font-bold text-indigo-700 mb-6">
              Today's Workflow
            </h2>
            <div className="overflow-y-auto max-h-96 space-y-4 pr-2">
              <AnimatePresence>
                {tasks.length === 0 ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-gray-500 text-center"
                  >
                    No tasks added yet.
                  </motion.p>
                ) : (
                  tasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className={`p-4 rounded-xl border ${
                        priorityColors[task.priority]
                      } transition-all flex justify-between items-center`}
                    >
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{task.title}</h3>
                        <p className="text-sm text-gray-600 mb-1">
                          {new Date(task.dueDate).toDateString()}
                        </p>
                        {task.description && (
                          <p className="text-sm text-gray-500 italic">{task.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        className="ml-4 bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 transition-colors"
                      >
                        ✓
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGenerateQR}
              className="absolute top-4 right-4 bg-green-500 text-white flex items-center gap-2 px-4 py-2 rounded-full shadow-md hover:bg-green-600 transition-all group"
            >
              <AiOutlineQrcode size={24} />
              <span className="hidden group-hover:inline-block ml-2 text-sm">
                Take your schedule
              </span>
            </motion.button>
          </motion.div>
        </div>

        {/* Quote Section */}
        {quote && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 bg-white border-l-8 border-indigo-500 p-6 rounded-xl shadow-lg"
          >
            <p className="text-xl italic text-gray-700 mb-3">"{quote.content}"</p>
            <p className="text-right font-semibold text-indigo-600">- {quote.author}</p>
          </motion.div>
        )}

        {/* QR Code Modal */}
        <AnimatePresence>
          {showQRModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                className="bg-white p-8 rounded-2xl w-full max-w-md text-center relative shadow-2xl"
              >
                <button
                  onClick={() => setShowQRModal(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
                >
                  ✕
                </button>
                <h3 className="text-2xl font-bold text-indigo-700 mb-6">
                  Today's Schedule QR Code
                </h3>
                <div className="flex justify-center mb-6">
                  <QRCodeSVG
                    id="qr-code-svg"
                    value={qrCodeData}
                    size={256}
                    bgColor={'#ffffff'}
                    fgColor={'#000000'}
                    level={'M'}
                    includeMargin={true}
                  />
                </div>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={downloadQRCode}
                    className="inline-block bg-indigo-500 text-white px-6 py-2 rounded-xl hover:bg-indigo-600 transition-colors"
                  >
                    Download QR Code
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(qrCodeData);
                      alert('Tasks copied to clipboard!');
                    }}
                    className="inline-block bg-green-500 text-white px-6 py-2 rounded-xl hover:bg-green-600 transition-colors"
                  >
                    Copy Tasks
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

       {/* Sign Out and Focus Zone Buttons */}
<div className="text-center mt-10 flex justify-center space-x-4">
  <button
    onClick={handleSignOut}
    className="bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-red-600 transition-colors"
  >
    Sign Out
  </button>
  <button
    onClick={() => setIsInFocusMode(true)}
    className="bg-blue-500 text-white px-6 py-2 rounded-xl hover:bg-blue-600 transition-colors flex items-center space-x-2"
  >
    <Timer className="mr-2" />
    Enter Focus Zone
  </button>
  </div>
        </div>
      </div>
    )}
  </>
)};


export default PlanningArea;