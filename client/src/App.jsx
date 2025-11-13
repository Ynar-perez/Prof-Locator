// client/src/App.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
// import { Toaster, toast } from 'sonner'
import './App.css'; 

function App() {
  return (
    <div className="App">
      {/* 💡 The main content (Login, Dashboard, etc.) renders here */}
      {/* <Toaster /> */}
      <Outlet /> 
    </div>
  );
}

export default App;