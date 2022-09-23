import React, { useState, useEffect } from 'react'
import Registration from './pages/Registration';
import Login from './pages/Login';
import Home from './pages/Home';
import Test from './pages/Test';
import Message from './pages/Message';
import ReactDOM from "react-dom/client";
import { BiToggleLeft, BiToggleRight } from 'react-icons/bi'

import { db } from './FirebaseConfig'
import { collection } from 'firebase/firestore'

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ResetPassword from './pages/ResetPassword';




function App() {

  const auth = getAuth();

  let [dlMode, setdlMode] = useState(false)
  let [showMode, setshowMode] = useState(false)

  let handleMode = () => {
    setdlMode(!dlMode)
  }

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setshowMode(true)
      } else {
        setshowMode(false)
        setdlMode(false)
      }
    });
  }, [])
  return (


    <div className={dlMode ? "dark" : "light"}>

      {showMode
        ?
        <div className='switch' onClick={() => handleMode()}>
        {dlMode
          ?
          <span className='text'><BiToggleLeft className='darkMode' />Switch to light</span>
          :
          <span className='text'><BiToggleRight className='lightMode' />Switch to dark</span>
        }
      </div>
      :
      ""
      }

      

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Registration />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/home" element={<Home />}></Route>
          <Route path="/message" element={<Message />}></Route>
          <Route path="/test" element={<Test />}></Route>
          <Route path="/resetpassword" element={<ResetPassword />}></Route>
        </Routes>
      </BrowserRouter>

    </div>
  );
}

export default App;
