import React, { useState, useEffect } from 'react';
import { Timer, Pause, Play, XCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth } from 'firebase/auth';

const BackgroundCircles = () => {
  const generateCircles = () => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 400 - 25, 
      y: Math.random() * 150 - 25,
      size: Math.random() * 300 + 100, 
      speed: Math.random() * 2 + 1,
      delay: Math.random() * 2
    }));
  };

  const [circles, setCircles] = useState(generateCircles());

  useEffect(() => {
    const animateCircles = () => {
      setCircles(prevCircles => 
        prevCircles.map(circle => ({
          ...circle,
          x: (circle.x + circle.speed * 0.1) % 150 - 25,
          y: (circle.y + circle.speed * 0.1) % 150 - 25
        }))
      );
    };

    const intervalId = setInterval(animateCircles, 50);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {circles.map((circle) => (
        <motion.div
          key={circle.id}
          initial={{ 
            opacity: 0.1,
            scale: 0.5,
            x: `${circle.x}%`, 
            y: `${circle.y}%`
          }}
          animate={{ 
            opacity: [0.2, 0.4, 0.2],
            scale: [0.5, 0.7, 0.5],
            x: `${circle.x}%`, 
            y: `${circle.y}%`
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: circle.delay
          }}
          style={{
            position: 'absolute',
            borderRadius: '50%',
            backgroundColor: 'rgba(224, 170, 255, 0.5)', // Lighter purple with more opacity
            width: `${circle.size}px`,
            height: `${circle.size}px`
          }}
        />
      ))}
    </div>
  );
};

const FocusZoneComponent = ({ onExit }) => {
    const [startTime, setStartTime] = useState(Date.now());
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isRunning, setIsRunning] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const [breaks, setBreaks] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [backgroundColor, setBackgroundColor] = useState('bg-purple-900');
    const [userId, setUserId] = useState('');
    const [focusTextColor, setFocusTextColor] = useState('#FFFFFF');
    const [userNotes, setUserNotes] = useState('');
  
    // List of hex colors for focus text
    const focusColors = [
      '#FF5733', // Red-orange
      '#33FF57', // Green
      '#3357FF', // Blue
      '#F033FF', // Purple
      '#FF33F0', // Pink
      '#33FFF0', // Cyan
      '#FFFF33'  // Yellow
    ];
  
    useEffect(() => {
      // Fetch current user from Firebase Authentication
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Use display name, email, or fallback to user ID
        setUserId(currentUser.displayName || currentUser.email || currentUser.uid);
      }

      let intervalId;
      if (isRunning && !isPaused) {
        intervalId = setInterval(() => {
          setElapsedTime(Date.now() - startTime);
        }, 10);
      }
      return () => clearInterval(intervalId);
    }, [startTime, isRunning, isPaused]);
  
    // Color change effect for FOCUS NOW text
    useEffect(() => {
      const colorIntervalId = setInterval(() => {
        const randomColor = focusColors[Math.floor(Math.random() * focusColors.length)];
        setFocusTextColor(randomColor);
      }, 3000);
      
      return () => clearInterval(colorIntervalId);
    }, []);
  
    const formatTime = (totalMilliseconds) => {
      const hours = Math.floor(totalMilliseconds / 3600000);
      const minutes = Math.floor((totalMilliseconds % 3600000) / 60000);
      const seconds = Math.floor((totalMilliseconds % 60000) / 1000);
      const milliseconds = Math.floor(totalMilliseconds % 1000);
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    };
  
    const handlePause = () => {
      setIsPaused(!isPaused);
      if (!isPaused) {
        setBreaks(prev => prev + 1);
        setBackgroundColor('bg-purple-800'); // Change background on pause
      } else {
        setBackgroundColor('bg-purple-900'); // Return to original background
      }
    };
  
    const handleFinish = () => {
      setIsFinished(true);
      setIsRunning(false);
    };
  
    const handleButtonClick = () => {
      // Randomly change background color when buttons are clicked
      const colors = [
        'bg-purple-800', 'bg-purple-900', 'bg-indigo-900'
      ];
      setBackgroundColor(colors[Math.floor(Math.random() * colors.length)]);
    };
  
    if (isFinished) {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`fixed inset-0 ${backgroundColor} flex flex-col items-center justify-center`}
        >
          <BackgroundCircles />
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="text-center z-10"
          >
            <div className="text-6xl font-bold text-green-300 mb-4">
              {formatTime(elapsedTime)}
            </div>
            <div className="text-xl text-white mb-2">
              Breaks Taken: {breaks}
            </div>
            <button 
              onClick={onExit}
              className="bg-green-500 text-white px-6 py-3 rounded-md
              hover:bg-green-600 transition-all duration-300 mt-4"
            >
              Exit Focus Zone
            </button>
          </motion.div>
          {userId && (
            <div className="absolute bottom-4 text-sm text-white opacity-70 z-10">
              Great job focusing, {userId}!
            </div>
          )}
        </motion.div>
      );
    }
  
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`fixed inset-0 transition-colors duration-500 ${backgroundColor} flex flex-col`}
      >
        <BackgroundCircles />
        {/* Timer */}
        <div className="absolute top-6 left-6 text-6xl font-mono z-10">
          <div className="flex items-center space-x-2">
            <Timer className="text-white" />
            <span className={`${isPaused ? 'text-gray-300' : 'text-white'}`}>
              {formatTime(elapsedTime)}
            </span>
          </div>
        </div>

        {/* FOCUS NOW!!! text with user ID below it */}
        <div className="flex-grow flex items-center justify-center flex-col z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-9xl font-bold opacity-20 text-center"
            style={{ color: focusTextColor }}
          >
            FOCUS NOW!!!
          </motion.div>
          {userId && (
            <div className="text-lg text-white opacity-70 mt-4">
              It's time to focus, {userId}!!!
            </div>
          )}
        </div>

        {/* Notes box in bottom left */}
        <div className="absolute bottom-4 left-4 z-10 w-64">
          <textarea
            value={userNotes}
            onChange={(e) => setUserNotes(e.target.value)}
            placeholder="Add quick notes here..."
            className="w-full p-2 rounded-md text-black"
            style={{ backgroundColor: '#FFFFC0' }} // Light yellow background
            rows={3}
          />
        </div>

        {/* Buttons at the bottom */}
        <div className="pb-10 flex justify-center space-x-4 z-10">
          {!isPaused ? (
            <button 
              onClick={() => { handlePause(); handleButtonClick(); }}
              className="bg-amber-500 text-white px-6 py-3 
              hover:bg-amber-600 transition-all duration-300 
              flex items-center space-x-2 rounded-md"
            >
              <Pause />
              Pause
            </button>
          ) : (
            <button 
              onClick={() => { handlePause(); handleButtonClick(); }}
              className="bg-emerald-500 text-white px-6 py-3 
              hover:bg-emerald-600 transition-all duration-300 
              flex items-center space-x-2 rounded-md"
            >
              <Play />
              Continue
            </button>
          )}
  
          <button 
            onClick={() => { handleFinish(); handleButtonClick(); }}
            className="bg-rose-500 text-white px-6 py-3 
            hover:bg-rose-600 transition-all duration-300 
            flex items-center space-x-2 rounded-md"
          >
            <CheckCircle />
            Finish Session
          </button>
  
          <button 
            onClick={() => { onExit(); handleButtonClick(); }}
            className="bg-slate-500 text-white px-6 py-3 
            hover:bg-slate-600 transition-all duration-300 
            flex items-center space-x-2 rounded-md"
          >
            <XCircle />
            Exit Zone
          </button>
        </div>
      </motion.div>
    );
};

export default FocusZoneComponent;