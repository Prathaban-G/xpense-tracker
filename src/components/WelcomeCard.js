import React, { useEffect, useState } from 'react';
import { PiggyBank, TrendingUp, Calendar, Settings, ChevronRight, DollarSign, Sparkles } from 'lucide-react';

const WelcomeCard = ({ userName, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [shimmerActive, setShimmerActive] = useState(false);

  useEffect(() => {
    // Entrance animation timing
    setVisible(true);
    
    // Shimmer effect timing
    const shimmerInterval = setInterval(() => {
      setShimmerActive(prev => !prev);
    }, 4000);
    
    // Auto-rotate through features
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev === 3 ? 0 : prev + 1));
    }, 3000);
    
    return () => {
      clearInterval(interval);
      clearInterval(shimmerInterval);
    };
  }, []);

  const features = [
    {
      icon: <PiggyBank className="text-rose-400" />,
      title: "Track Expenses",
      description: "Log and categorize your daily expenses to understand your spending habits."
    },
    {
      icon: <TrendingUp className="text-emerald-400" />,
      title: "Budget Goals",
      description: "Set monthly budget targets and track your progress toward financial freedom."
    },
    {
      icon: <Calendar className="text-blue-400" />,
      title: "Financial Calendar",
      description: "Get reminders for bills and visualize spending patterns over time."
    },
    {
      icon: <Settings className="text-amber-400" />,
      title: "Personalization",
      description: "Customize categories and reports to match your financial lifestyle."
    }
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 backdrop-blur-sm">
      <div 
        className={`bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-lg transform transition-all duration-700 overflow-hidden ${visible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-blue-500 bg-opacity-10 blur-xl"
              style={{
                width: `${Math.random() * 200 + 50}px`,
                height: `${Math.random() * 200 + 50}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: 'translate(-50%, -50%)',
                animation: `float ${Math.random() * 10 + 10}s infinite alternate ease-in-out`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>

        {/* Confetti Animation Effect */}
        <div className="absolute -top-8 left-0 right-0 overflow-hidden h-32 pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-8 rounded-full bg-gradient-to-b ${
                i % 5 === 0 ? 'from-blue-400 to-blue-600' :
                i % 5 === 1 ? 'from-pink-400 to-pink-600' :
                i % 5 === 2 ? 'from-green-400 to-green-600' :
                i % 5 === 3 ? 'from-yellow-400 to-yellow-600' :
                'from-purple-400 to-purple-600'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1.5}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
                animation: 'fall 2s ease-in forwards'
              }}
            />
          ))}
        </div>

        {/* Header with Logo */}
        <div className="p-6 text-center relative z-10">
          {/* Logo */}
          <div className={`mt-3 mb-6 transform transition-all duration-700 ${visible ? 'scale-100' : 'scale-50'}`}>
            <h1 className="flex items-center justify-center space-x-2 font-extrabold">
              <span className={`text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 text-6xl drop-shadow-lg relative ${shimmerActive ? 'animate-pulse' : ''}`}>
                X
                <Sparkles className="absolute -top-4 -right-4 w-6 h-6 text-yellow-300 animate-ping" />
              </span>
              <span className="text-white text-3xl tracking-wide">penseTracker</span>
              <PiggyBank className="w-10 h-10 text-rose-400 animate-bounce" />
            </h1>
          </div>
          
          <div className="relative">
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-3xl opacity-20"></div>
            <h2 className="text-3xl font-bold text-white mb-2 relative">Welcome Aboard!</h2>
          </div>
          <p className="text-gray-300 max-w-md mx-auto">
            Hi{userName ? ` ${userName}` : ''}, your financial transformation begins now. Let's make every penny count!
          </p>
        </div>

        {/* Feature Carousel */}
        <div className="p-6 pt-2">
          <div className="relative h-48">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`absolute inset-0 flex items-center transition-all duration-700 transform ${
                  activeStep === index
                    ? 'translate-x-0 opacity-100'
                    : activeStep > index
                    ? '-translate-x-full opacity-0'
                    : 'translate-x-full opacity-0'
                }`}
              >
                <div className="bg-gray-800 bg-opacity-60 p-6 rounded-xl border border-gray-700 flex items-start space-x-4 w-full backdrop-blur-sm shadow-lg hover:shadow-xl transition-all">
                  <div className="bg-gray-700 p-3 rounded-lg transform transition-all duration-300 hover:scale-110">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-300">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Indicators */}
          <div className="flex justify-center space-x-2 mt-6">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveStep(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeStep === index ? 'bg-blue-500 w-8' : 'bg-gray-600 w-2 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Coins Animation at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute bottom-0"
              style={{
                left: `${Math.random() * 100}%`,
                animation: `coinFloat ${3 + Math.random() * 4}s infinite ease-in-out`,
                animationDelay: `${Math.random() * 2}s`
              }}
            >
              <div className="relative">
                <DollarSign 
                  size={24} 
                  className={`${
                    i % 3 === 0 ? 'text-yellow-400' : 
                    i % 3 === 1 ? 'text-blue-400' : 'text-rose-400'
                  }`} 
                />
              </div>
            </div>
          ))}
        </div>

        {/* Branding & Action */}
        <div className="p-6 border-t border-gray-700 flex justify-between items-center bg-gray-900 bg-opacity-50 relative z-10">
          <div className="text-sm text-gray-400">
            Developed by Decent Tech
          </div>
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-all hover:shadow-lg transform hover:-translate-y-1 group"
          >
            Get Started 
            <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Global Styles */}
        <style jsx>{`
          @keyframes fall {
            0% {
              transform: translateY(-100px) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(60px) rotate(180deg);
              opacity: 0;
            }
          }
          
          @keyframes float {
            0% {
              transform: translate(-50%, -50%) scale(1);
            }
            100% {
              transform: translate(-50%, -40%) scale(1.1);
            }
          }
          
          @keyframes coinFloat {
            0% {
              transform: translateY(100%);
              opacity: 0;
            }
            20% {
              opacity: 1;
            }
            80% {
              opacity: 1;
            }
            100% {
              transform: translateY(-100px);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default WelcomeCard;