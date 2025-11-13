// client/src/App.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import './App.css'; 

function App() {
  return (
    <div className="App">
      {/* 💡 The main content (Login, Dashboard, etc.) renders here */}
      <Outlet /> 
    </div>
  );
}

export default App;