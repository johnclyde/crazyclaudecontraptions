import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ComponentDirectory from './ComponentDirectory';
import InteractiveCounter from './InteractiveCounter';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ComponentDirectory />} />
        <Route path="/interactive-counter" element={<InteractiveCounter />} />
        {/* Add more routes here as you create new components */}
      </Routes>
    </Router>
  );
};

export default App;
