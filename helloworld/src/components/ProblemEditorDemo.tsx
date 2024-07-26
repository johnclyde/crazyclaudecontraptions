import React, { useState } from "react";
import ProblemEditor, { Problem } from "./ProblemEditor";

const initialProblem: Problem = {
  id: "demo-problem",
  number: 1,
  problem: `\\text{Solve the equation:}

\\[x^2 + 4x + 4 = 0\\]

\\text{What is the value of } x\\text{?}

option A: $x = -2$
option B: $x = 2$
option C: $x = \\pm 2$
option D: $x = -2 \\pm 2i$
option E: \\text{The equation has no solution}`,
};

const ProblemEditorDemo: React.FC = () => {
  const [problem, setProblem] = useState(initialProblem);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (updatedProblem: Problem) => {
    setProblem(updatedProblem);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Problem Editor Demo</h1>
      {isEditing ? (
        <ProblemEditor
          problem={problem}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <div>
          <ProblemEditor
            problem={problem}
            onSave={() => {}}
            onCancel={() => {}}
            readOnly
          />
          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit Problem
          </button>
        </div>
      )}
    </div>
  );
};

export default ProblemEditorDemo;
