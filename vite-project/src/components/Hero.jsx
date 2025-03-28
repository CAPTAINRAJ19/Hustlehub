import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebaseconfig';
import Authentication from './authentication';
import PlanningArea from './PlanningArea';  // Import the new PlanningArea component
import { User, Sun, Cloud, CloudRain, CloudSnow, CloudFog, AlertTriangle, Clock, ArrowDown } from 'lucide-react';

function Hero({ user }) {
  const [isSignedOut, setIsSignedOut] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);
  const [error, setError] = useState(null);
  const [showPlanningArea, setShowPlanningArea] = useState(false);

  // OpenWeatherMap API Key
  const OPENWEATHER_API_KEY = 'fa9f5f8cecbe205e215c540475f10158';



  useEffect(() => {
    const fetchLocationAndWeather = async () => {
      try {
        // Fetch IP and Location with timeout
        const locationController = new AbortController();
        const locationTimeout = setTimeout(() => locationController.abort(), 5000);

        try {
          const ipResponse = await fetch('https://ipapi.co/json/', { 
            signal: locationController.signal 
          });
          
          if (!ipResponse.ok) {
            throw new Error('Location fetch failed');
          }
          
          const locationData = await ipResponse.json();
          clearTimeout(locationTimeout);
          setLocation(locationData);

          // Set up timezone and time tracking
          const timeZone = locationData.timezone;
          const updateTime = () => {
            const options = { 
              timeZone, 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit', 
              hour12: true 
            };
            setCurrentTime(new Date().toLocaleTimeString('en-US', options));
          };
          
          // Initial time set
          updateTime();
          
          // Update time every second
          const timeInterval = setInterval(updateTime, 1000);

          // Fetch Weather with timeout
          if (locationData.latitude && locationData.longitude) {
            const weatherController = new AbortController();
            const weatherTimeout = setTimeout(() => weatherController.abort(), 5000);

            try {
              const weatherResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${locationData.latitude}&lon=${locationData.longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`,
                { signal: weatherController.signal }
              );

              if (!weatherResponse.ok) {
                throw new Error('Weather fetch failed');
              }

              const weatherData = await weatherResponse.json();
              clearTimeout(weatherTimeout);
              setWeather(weatherData);
            } catch (weatherError) {
              console.error('Weather fetch error:', weatherError);
              setError('Could not fetch weather data');
            }

            // Cleanup function
            return () => {
              clearInterval(timeInterval);
            };
          }
        } catch (locationError) {
          console.error('Location fetch error:', locationError);
          setError('Could not fetch location data');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setError('Network error occurred');
      }
    };

    const fetchProcess = fetchLocationAndWeather();
    return () => {
      if (fetchProcess && typeof fetchProcess.then === 'function') {
        fetchProcess.then(cleanup => {
          if (typeof cleanup === 'function') {
            cleanup();
          }
        });
      }
    };
  }, []);

  // Weather icon mapping
  const getWeatherIcon = (weatherMain) => {
    const iconProps = { className: "w-8 h-8 text-white" };
    switch (weatherMain) {
      case 'Clear': return <Sun {...iconProps} />;
      case 'Clouds': return <Cloud {...iconProps} />;
      case 'Rain': return <CloudRain {...iconProps} />;
      case 'Snow': return <CloudSnow {...iconProps} />;
      case 'Mist':
      case 'Fog':
      case 'Haze': return <CloudFog {...iconProps} />;
      default: return <Cloud {...iconProps} />;
    }
  };

  const getCurrentTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsSignedOut(true);
    } catch (error) {
      console.error('Sign out error:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleEnterPlanningArea = () => {
    setShowPlanningArea(true);
    
  };
  if (isSignedOut) {
    return <Authentication />;
  }

  // If planning area is shown, render it
  if (showPlanningArea) {
    return <PlanningArea />;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex flex-col overflow-hidden">
      {/* Background bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full animate-[blob_7s_infinite]"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/10 rounded-full animate-[blob_7s_infinite] animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-white/10 rounded-full animate-[blob_7s_infinite] animation-delay-4000"></div>
      </div>
  
      {/* Weather & Location */}
      <div className="absolute top-4 left-4 text-left z-10 animate-fade-in">
        {error ? (
          <div className="flex items-center space-x-2 text-red-300">
            <AlertTriangle className="w-6 h-6" />
            <p className="text-xs">{error}</p>
          </div>
        ) : weather && location && currentTime ? (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              {getWeatherIcon(weather.weather[0].main)}
              <div>
                <p className="text-sm font-medium text-white">
                  {Math.round(weather.main.temp)}°C | {weather.weather[0].main}
                </p>
                <p className="text-xs text-white/80">
                  {location.city}, {location.country_name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-white/80" />
              <p className="text-xs text-white/80">
                {currentTime} | {location.timezone}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-white/70">Fetching location...</p>
        )}
      </div>
  
      {/* Profile Section */}
      <div className="absolute top-4 right-4 text-right z-10 animate-fade-in">
        {user.photoURL && !imageError ? (
          <img
            src={user.photoURL}
            alt="User Profile"
            className="w-16 h-16 rounded-full border-3 border-white/90 ml-auto mb-4 object-cover 
                     shadow-lg hover:scale-110 transition-transform duration-300"
            onError={handleImageError}
          />
        ) : (
          <div className="w-16 h-16 rounded-full border-3 border-white/90 ml-auto mb-4 bg-white/20 
                        flex items-center justify-center hover:scale-110 transition-transform duration-300">
            <User className="w-8 h-8 text-white/70" />
          </div>
        )}
        <p className="text-sm text-white/90 font-medium">{user.displayName || 'User'}</p>
        <p className="text-xs text-white/70 mt-1">{user.email}</p>
      </div>
  
      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-center text-center px-4">
        <div className="animate-fade-in">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-transparent bg-clip-text 
            bg-gradient-to-r from-white via-white/90 to-white/70
            mb-4 tracking-tighter uppercase">
            Hustle Hub
          </h1>
          <p className="text-xl md:text-2xl text-white/80 font-light mb-8 animate-pulse">
            Your space for organized hustle
          </p>
        </div>
  
        <div className="bg-white/20 backdrop-blur-lg rounded-2xl px-4 md:p-10 shadow-2xl 
                      max-w-md w-full transition-all duration-500 hover:scale-105">
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6">
            {getCurrentTime()},
            <br />
            <span className="text-white/90 font-medium text-2xl">{user.email}</span>
          </h2>
  
          <button
            onClick={handleSignOut}
            className="mt-2 w-full py-2 px-6 
            bg-gradient-to-r from-indigo-600 to-purple-600
            text-white rounded-xl
            hover:from-indigo-700 hover:to-purple-700
            transition-all duration-300
            transform hover:scale-105 hover:shadow-lg
            active:scale-95 font-semibold tracking-wide
            border-2 border-white/20"
          >
            Sign Out
          </button>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-fade-in-up">
        <button 
          onClick={handleEnterPlanningArea}
          className="flex items-center space-x-2 bg-white/20 backdrop-blur-lg px-6 py-3 rounded-full
                   hover:bg-white/30 transition-all duration-300 hover:scale-105
                   border-2 border-white/30 hover:border-white/50
                   group shadow-lg"
        >
          <span className="text-white/90 font-medium">Enter Planning Area</span>
          <ArrowDown className="w-5 h-5 text-white/80 animate-bounce-slow 
                              group-hover:translate-y-1 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
}

export default Hero;