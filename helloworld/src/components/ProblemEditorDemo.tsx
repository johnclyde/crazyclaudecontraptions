import React, { useState } from "react";
import ProblemEditor, { Problem } from "./ProblemEditor";

const initialProblem: Problem = {
  id: "demo-problem",
  number: 1,
  problem: `\\text{Solve the equation:}

\\[x^2 + 4x + 4 = 0\\]

\\text{What is the value of } x\\text{?}

__OPTION_A__$x = -2$
__OPTION_B__$x = 2$
__OPTION_C__$x = \\pm 2$
__OPTION_D__$x = -2 \\pm 2i$
__OPTION_E__\\text{The equation has no solution}

\\text{Explain your reasoning using the quadratic formula:}

\\[x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\\]

\\text{where } a = 1, b = 4, \\text{ and } c = 4.`,
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
