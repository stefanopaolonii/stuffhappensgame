import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

import { useEffect, useState } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Header from "./components/Header.jsx";
import API from "./API.mjs";
import {Auth} from "./components/Auth.jsx";
import Profile from "./components/Profile.jsx";
import Game from "./components/Game.jsx";
import FeedbackContext from './context/FeedbackContext.js';
import { Toast, ToastBody, Container } from 'react-bootstrap';

function App() {
  const [user, setUser] = useState(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const [feedback, setFeedback] = useState('')
  
  // UseEffect to check session
  useEffect(() => {
    API.getSession()
    .then(user => {
      setUser(user)
      setLoggedIn(true);
    })
    .catch(
      (error) => {
        setFeedbackFromError(error);
        setLoggedIn(false);
        setUser(null);
      }
    );
  }, []);

  // Function to set feedback message
  const setFeedbackFromError = (error) => {
    let message = '';
    if(error.message) {
      message = error.message;
    }else{
      message = 'An unexpected error occurred.';
    }
    setFeedback(message);
  }

  // Function to handle login
  const handleLogin = async (credentials) => {
      const user = await API.logIn(credentials);
      setUser(user);
      setLoggedIn(true);
  }

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await API.logOut();
      setUser(null);
      setLoggedIn(false);
    } catch (error) {
      setFeedbackFromError(error);
    }
  }

  return (
    <FeedbackContext.Provider value={{ setFeedback, setFeedbackFromError }}>
      <div className="d-flex flex-column min-vh-100">
        <Header loggedIn={loggedIn} logout={handleLogout} />
        <Container fluid className="flex-grow-1 d-flex flex-column">
          <Routes>
            <Route path="/" element={ !loggedIn ? <Navigate replace to='/login' /> : <Profile />} />
            <Route path="/login" element={loggedIn ? <Navigate replace to='/' /> : <Auth login={handleLogin} />} />
            <Route path="/game" element={!loggedIn ? <Navigate replace to='/login' /> : <Game />} />
            <Route path="/demogame" element={<Game />} />
          </Routes>
          <Toast
            show= {feedback !== ''}
            autohide
            onClose={() => setFeedback('')}
            delay={3000}
            position="top-end"
            className="position-fixed end-0 m-3"
          >
            <ToastBody>
              {feedback}
            </ToastBody>
          
          </Toast>
        </Container>
      </div>
    </FeedbackContext.Provider>
  );
}

export default App;
