// App.js
import React, { useState, createContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Welcome from './components/Welcome';
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./components/firebase";
import LoadingAnimation from './components/LoadingAnimation';

// Context
export const UserContext = createContext(null);

// ProtectedRoute
const ProtectedRoute = ({ children }) => {
  const { user } = React.useContext(UserContext);
  return user ? children : <Navigate to="/login" />;
};

function App() {
  const [user, setUser] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const username = currentUser.email.split('@')[0];
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          username: username,
        });

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setIsNewUser(userData.isNewUser);
        } else {
          setIsNewUser(true); // Default to true if no doc exists
        }
      } else {
        setUser(null);
        setIsNewUser(false);
      }

      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (authLoading) {
    return <LoadingAnimation />;
  }

  return (
    <UserContext.Provider value={{ user, setUser, isNewUser, setIsNewUser }}>
      <Router>
        <div className="app">
          <Routes>
            <Route
              path="/login"
              element={
                !user ? (
                  <Login />
                ) : isNewUser ? (
                  <Navigate to="/welcome" />
                ) : (
                  <Navigate to="/dashboard" />
                )
              }
            />
            <Route
              path="/welcome"
              element={user ? <Welcome /> : <Navigate to="/login" />}
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <Navigate to={user ? (isNewUser ? "/welcome" : "/dashboard") : "/login"} />
              }
            />
            <Route
              path="*"
              element={
                <Navigate to={user ? (isNewUser ? "/welcome" : "/dashboard") : "/login"} />
              }
            />
          </Routes>
        </div>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
