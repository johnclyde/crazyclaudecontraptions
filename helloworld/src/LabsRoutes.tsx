import React from "react";
import { Route, Routes } from "react-router-dom";
import ComponentDirectory from "./ComponentDirectory";
import BanzukeSurfer from "./components/BanzukeSurfer";
import ColorPicker from "./components/ColorPicker";
import InteractiveCounter from "./components/InteractiveCounter";
import ProblemEditorDemo from "./components/ProblemEditorDemo";
import LoginWarningPopup from "./components/LoginWarningPopup";

const LabsRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ComponentDirectory />} />
      <Route path="banzuke-surfer" element={<BanzukeSurfer />} />
      <Route path="interactive-counter" element={<InteractiveCounter />} />
      <Route path="color-picker" element={<ColorPicker />} />
      <Route path="problem-editor-demo" element={<ProblemEditorDemo />} />
      <Route path="login-warning-popup" element={<LoginWarningPopup />} />
    </Routes>
  );
};

export default LabsRoutes;
