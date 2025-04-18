import React, { useState, useEffect } from 'react';
import { Code, Sparkles, Zap } from 'lucide-react';

const CompanyBranding = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [sparklePosition, setSparklePosition] = useState({ top: -2, right: -4 });

  useEffect(() => {
    if (isHovered) {
      const interval = setInterval(() => {
        setSparklePosition({
          top: -2 + Math.sin(Date.now() / 500) * 1,
          right: -4 + Math.cos(Date.now() / 700) * 1
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isHovered]);

  return (
    <div 
      className="inline-flex items-center space-x-3 px-3 py-2 cursor-pointer transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <Code 
          size={20} 
          className="text-blue-500 dark:text-blue-400 transition-all duration-300" 
          style={{
            filter: isHovered ? 'drop-shadow(0 0 3px rgba(59, 130, 246, 0.5))' : 'none',
            transform: isHovered ? 'rotate(-10deg)' : 'rotate(0deg)'
          }}
        />
        {isHovered && (
          <span className="absolute -bottom-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
        )}
      </div>
      
      <div className="relative">
        <div className="relative z-10">
          <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 transition-colors duration-300">
            Decent
          </span>
          <span className="font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-600 to-purple-700 transition-colors duration-300">
            Tech
          </span>
        </div>
        
        <Sparkles 
          size={14} 
          className="absolute text-blue-300 transition-all duration-500"
          style={{
            top: `${sparklePosition.top}px`,
            right: `${sparklePosition.right}px`,
            opacity: isHovered ? 0.9 : 0,
            transform: isHovered ? 'scale(1.2)' : 'scale(0.8)'
          }}
        />
        
        <div className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 rounded-full"
          style={{ width: isHovered ? '100%' : '0%' }}
        ></div>
      </div>
      
      {isHovered && (
        <Zap 
          size={16} 
          className="text-yellow-400 ml-1 animate-pulse"
        />
      )}
    </div>
  );
};

export default CompanyBranding;
