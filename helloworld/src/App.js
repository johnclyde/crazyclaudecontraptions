import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import BanzukeSurfer from "./components/BanzukeSurfer";
import ColorPicker from "./components/ColorPicker";
import ComponentDirectory from "./ComponentDirectory";
import GrindOlympiadsIndex from "./GrindOlympiadsIndex.js";
import InteractiveCounter from "./components/InteractiveCounter";
import Navbar from "./components/Navbar";
import ExamComponent from "./components/ExamComponent";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GrindOlympiadsIndex />} />
        <Route
          path="/competition/:competition/:year/:exam"
          element={<ExamComponent />}
        />
        <Route
          path="/labs/*"
          element={
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route index element={<ComponentDirectory />} />
                  <Route path="banzuke-surfer" element={<BanzukeSurfer />} />
                  <Route
                    path="interactive-counter"
                    element={<InteractiveCounter />}
                  />
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
