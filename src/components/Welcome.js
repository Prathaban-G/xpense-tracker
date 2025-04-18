// components/Welcome.js

import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import WelcomeCard from './WelcomeCard';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

const Welcome = () => {
  const { user, setIsNewUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const updateIsNewUser = async () => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, { isNewUser: false });
          setIsNewUser(false);
        } catch (error) {
          console.error("Error updating isNewUser:", error);
        }
      }
    };

    updateIsNewUser();
  }, [user, setIsNewUser]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleWelcomeClose = () => {
    navigate('/dashboard');
  };

  return (
    <WelcomeCard
      userName={user?.email?.split('@')[0]}
      onClose={handleWelcomeClose}
    />
  );
};

export default Welcome;
