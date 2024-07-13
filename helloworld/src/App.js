import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import BanzukeSurfer from './BanzukeSurfer';
import ColorPicker from './ColorPicker';
import ComponentDirectory from './ComponentDirectory';
import GrindOlympiadsIndex from './GrindOlympiadsIndex.js';
import InteractiveCounter from './InteractiveCounter';
import Navbar from './Navbar';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GrindOlympiadsIndex />} />
        <Route
          path="/labs/*"
          element={
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route index element={<ComponentDirectory />} />
                  <Route path="banzuke-surfer" element={<BanzukeSurfer />} />
                  <Route path="interactive-counter" element={<InteractiveCounter />} />
                  <Route path="color-picker" element={<ColorPicker />} />
                </Routes>
              </main>
            </div>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
