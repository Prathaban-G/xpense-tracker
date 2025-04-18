import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Make sure to import this

import WelcomeCard from './Welcome';
import { doc, setDoc,updateDoc  } from "firebase/firestore";
import { auth, db } from "./firebase"; // Adjust the path to your Firebase config
import { PiggyBank,Eye, EyeOff } from 'lucide-react';
const Login = () => {
  // State management
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repassword, setrePassword] = useState('');

  const [regpassword, setregPassword] = useState('');
  const navigate = useNavigate();
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showregPassword, setShowregPassword] = useState(false);
  const [showrePassword, setShowrePassword] = useState(false);
// In your Login component after successful registration
const [showWelcome, setShowWelcome] = useState(false);
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const toggleregPasswordVisibility = () => {
    setShowregPassword(!showregPassword);
  };
  const togglerePasswordVisibility = () => {
    setShowrePassword(!showrePassword);
  };
  // Refs for Three.js
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);

  // Three.js background setup
  useEffect(() => {
    // Initialize Three.js scene
    sceneRef.current = new THREE.Scene();
    cameraRef.current = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    
    rendererRef.current = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current.setClearColor(0x000000, 0);
    
    // Append canvas to the DOM
    if (mountRef.current) {
      if (mountRef.current.children.length > 0) {
        mountRef.current.removeChild(mountRef.current.children[0]);
      }
      mountRef.current.appendChild(rendererRef.current.domElement);
    }
    
    // Camera position
    cameraRef.current.position.z = 5;
    
    // Create floating particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    
    const posArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x3498db,
      transparent: true,
      opacity: 0.8,
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    sceneRef.current.add(particlesMesh);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    sceneRef.current.add(ambientLight);
    
    // Add point light
    const pointLight = new THREE.PointLight(0x3498db, 1);
    pointLight.position.set(2, 3, 4);
    sceneRef.current.add(pointLight);
    
    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      
      particlesMesh.rotation.x += 0.0005;
      particlesMesh.rotation.y += 0.0005;
      
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && rendererRef.current.domElement) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  // Handle sign in
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Update user's Firestore document with latest login timestamp
      await updateDoc(doc(db, "users", user.uid), {
        lastLogin: new Date(),
      });
  
      // Redirect or handle successful sign-in
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle sign up

// In your Login.js component
const handleSignUp = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  if (regpassword !== repassword) {
    setError('Passwords do not match');
    setLoading(false);
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, regpassword);
    const user = userCredential.user;

    // Save user info in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      uid: user.uid,
      createdAt: new Date(),
      isNewUser: true // Add this flag
    });
    
    // The authentication state change will handle the redirect
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
// Handle welcome card close
  const handleWelcomeClose = () => {
    setShowWelcome(false);
    // Now navigate to dashboard
    navigate('/dashboard');
  };

  // Handle password reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Check your inbox.');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center relative overflow-hidden bg-gray-900">

      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="fixed inset-0 z-0" />
        {/* Welcome Card */}
      {showWelcome && (
        <WelcomeCard 
          userName={email.split('@')[0]} 
          onClose={handleWelcomeClose}
        />
      )}
      {/* Form Container */}
      <div className="relative z-10 w-full max-w-md px-4 ">
        {/* Logo */}
        <div className="text-center mb-8 pl-3">
        <h1 className="flex items-center space-x-2 font-extrabold pl-9">
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 text-6xl drop-shadow-lg">
        X
      </span>
      <span className="text-white text-3xl tracking-wide">penseTracker</span>
      <PiggyBank className="w-10 h-10 text-rose-400 animate-bounce" />
    </h1>
        </div>
        
        {/* Card Container with Animation */}
        <div className={`relative transform transition-all duration-500 ease-in-out ${isResetPassword ? 'translate-x-0' : isSignUp ? 'translate-x-0' : 'translate-x-0'}`}>
          {/* Reset Password Form */}
          {isResetPassword && (
            <div className="bg-white bg-opacity-10 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white border-opacity-20">
              <h2 className="text-2xl font-semibold text-white text-center mb-6">Reset Password</h2>
              
              {error && (
                <div className="bg-red-500 bg-opacity-20 text-red-100 px-4 py-3 rounded-lg mb-6 text-sm">
                  {error}
                </div>
              )}
              
              {message && (
                <div className="bg-green-500 bg-opacity-20 text-green-100 px-4 py-3 rounded-lg mb-6 text-sm">
                  {message}
                </div>
              )}
              
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium text-gray-200 mb-1">
                    Email
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white bg-opacity-10 border border-gray-300 border-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-lg text-white font-medium transition-all ${
                    loading
                      ? 'bg-blue-500 bg-opacity-50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transform hover:-translate-y-1 hover:shadow-lg'
                  }`}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsResetPassword(false)}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Sign In Form */}
          {!isResetPassword && !isSignUp && (
            <div className="bg-white bg-opacity-10 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white border-opacity-20">
              <h2 className="text-2xl font-semibold text-white text-center mb-6">Welcome Back</h2>
              
              {error && (
                <div className="bg-red-500 bg-opacity-20 text-red-100 px-4 py-3 rounded-lg mb-6 text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSignIn} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    placeholder='Enter Email'
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white bg-opacity-10 border border-gray-300 border-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    required
                  />
                </div>
                
                <div>
      <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-1">
        Password
      </label>
      <div className="relative">
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 bg-white bg-opacity-10 border border-gray-300 border-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          required
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 focus:outline-none"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-lg text-white font-medium transition-all ${
                    loading
                      ? 'bg-blue-500 bg-opacity-50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transform hover:-translate-y-1 hover:shadow-lg'
                  }`}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
                
                <div className="flex justify-between items-center text-sm">
                  <button
                    type="button"
                    onClick={() => setIsResetPassword(true)}
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Forgot Password?
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Sign Up Form */}
          {!isResetPassword && isSignUp && (
            <div className="bg-white bg-opacity-10 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white border-opacity-20">
              <h2 className="text-2xl font-semibold text-white text-center mb-6">Create Account</h2>
              
              {error && (
                <div className="bg-red-500 bg-opacity-20 text-red-100 px-4 py-3 rounded-lg mb-6 text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSignUp} className="space-y-6">
                <div>
                  <label htmlFor="signup-email" className="block text-sm font-medium text-gray-200 mb-1">
                    Email
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    
                    placeholder='Enter Email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white bg-opacity-10 border border-gray-300 border-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    required
                  />
                </div>
                <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-200 mb-1">
                    Password
                  </label>
      <div className="relative">
        <input
          id="signup-password"
        
          value={regpassword}
          
        
          type={showregPassword ? "text" : "password"}
          placeholder="Enter Password"
        
          onChange={(e) => setregPassword(e.target.value)}
          className="w-full px-4 py-3 bg-white bg-opacity-10 border border-gray-300 border-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          required
        />
        <button
          type="button"
          onClick={toggleregPasswordVisibility}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 focus:outline-none"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
                
    <div>
    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-200 mb-1">
                    Confirm Password
                  </label>
      <div className="relative">
        <input
           id="confirm-password"
                    
           placeholder='Re-enter Password'
        
          value={repassword}
          
        
          type={showrePassword ? "text" : "password"}
      
        
          onChange={(e) => setrePassword(e.target.value)}
          className="w-full px-4 py-3 bg-white bg-opacity-10 border border-gray-300 border-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          required
        />
        <button
          type="button"
          onClick={togglerePasswordVisibility}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 focus:outline-none"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
            
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-lg text-white font-medium transition-all ${
                    loading
                      ? 'bg-blue-500 bg-opacity-50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transform hover:-translate-y-1 hover:shadow-lg'
                  }`}
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                  >
                    Already have an account? Sign In
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;