import React from 'react'
import Login from './components/Login';
import SignUp from './components/Signup';
import Home from './components/home'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Details from './components/Details';

function App() {
  return (
    
    <Router>
      <Routes>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signUp' element={<SignUp/>}/>
        <Route path="/" element={<Home/>} />
        <Route path="/details/:symbol" element={<Details/>} />
      </Routes>
    </Router>
  );
}

export default App