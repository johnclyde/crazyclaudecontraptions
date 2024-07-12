import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ComponentDirectory from './ComponentDirectory';
import InteractiveCounter from './InteractiveCounter';
import Navbar from './Navbar';

const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<ComponentDirectory />} />
            <Route path="/interactive-counter" element={<InteractiveCounter />} />
            {/* Add more routes here as you create new components */}
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
