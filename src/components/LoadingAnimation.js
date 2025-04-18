import { useState, useEffect } from 'react';

export default function LoadingAnimation() {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState(1);
  
  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prevProgress => {
        const newProgress = prevProgress + 0.5;
        return newProgress > 100 ? 0 : newProgress;
      });
    }, 30);
    
    // Animated dots for "Loading..." text
    const dotsInterval = setInterval(() => {
      setDots(prev => prev < 3 ? prev + 1 : 1);
    }, 500);
    
    return () => {
      clearInterval(progressInterval);
      clearInterval(dotsInterval);
    };
  }, []);
  
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center w-screen h-screen bg-gradient-to-b from-gray-800 to-gray-900 z-50">
      {/* Centered content container */}
      <div className="flex flex-col items-center justify-center">
        {/* Orbital loading animation */}
        <div className="relative w-40 h-40 mb-8">
          {/* Outer spinning ring */}
          <div className="absolute w-full h-full rounded-full border-4 border-transparent border-t-blue-400 border-r-purple-500 animate-spin" 
               style={{ animationDuration: '3s' }}></div>
               
          {/* Middle spinning ring */}
          <div className="absolute w-32 h-32 top-4 left-4 rounded-full border-4 border-transparent border-t-teal-400 border-l-indigo-500 animate-spin" 
               style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
               
          {/* Inner spinning ring */}
          <div className="absolute w-24 h-24 top-8 left-8 rounded-full border-4 border-transparent border-b-pink-400 border-r-yellow-400 animate-spin" 
               style={{ animationDuration: '1.5s' }}></div>
               
          {/* Center pulse */}
          <div className="absolute w-12 h-12 top-14 left-14 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full animate-pulse shadow-lg"></div>
        </div>
        
        {/* Fancy progress bar */}
        <div className="w-80 h-4 bg-gray-700 rounded-full overflow-hidden shadow-inner mb-6">
          <div 
            className="h-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* Percentage counter */}
        <div className="text-2xl font-bold text-white mb-3">
          {Math.floor(progress)}%
        </div>
        
        {/* Loading text with animated dots */}
        <div className="flex items-center">
          <span className="text-gray-300 font-medium text-xl">Loading</span>
          <span className="w-12 inline-block text-gray-300 text-xl">
            {'.'.repeat(dots)}
          </span>
        </div>
      </div>
      
      {/* Floating particles across the screen */}
      <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-75" 
           style={{ animationDuration: '3s', animationDelay: '0.2s' }}></div>
      <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-purple-400 rounded-full animate-ping opacity-75" 
           style={{ animationDuration: '2.5s', animationDelay: '0.7s' }}></div>
      <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-pink-400 rounded-full animate-ping opacity-75" 
           style={{ animationDuration: '3.2s', animationDelay: '1.1s' }}></div>
      <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-teal-400 rounded-full animate-ping opacity-75" 
           style={{ animationDuration: '3.7s', animationDelay: '0.5s' }}></div>
      <div className="absolute top-1/3 right-1/2 w-3 h-3 bg-indigo-400 rounded-full animate-ping opacity-75" 
           style={{ animationDuration: '2.8s', animationDelay: '1.3s' }}></div>
    </div>
  );
}