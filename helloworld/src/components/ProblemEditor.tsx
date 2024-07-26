import React, { useState } from "react";
import LatexRenderer from "./LatexRenderer";

export interface Problem {
  id: string;
  number: number;
  problem: string;
  image_url?: string;
}

interface ProblemEditorProps {
  problem: Problem;
  onSave: (updatedProblem: Problem) => void;
  onCancel: () => void;
  readOnly?: boolean;
}

const ProblemEditor: React.FC<ProblemEditorProps> = ({
  problem,
  onSave,
  onCancel,
  readOnly = false,
}) => {
  const [editedProblem, setEditedProblem] = useState(problem.problem);

  const handleSave = () => {
    onSave({ ...problem, problem: editedProblem });
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">
        {readOnly
          ? `Problem ${problem.number}`
          : `Edit Problem ${problem.number}`}
      </h2>
      <div className="mb-4">
        <label
          htmlFor="problemLatex"
          className="block text-sm font-medium text-gray-700"
        >
          Problem LaTeX
        </label>
        <textarea
          id="problemLatex"
          rows={10}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          value={editedProblem}
          onChange={(e) => setEditedProblem(e.target.value)}
          readOnly={readOnly}
        />
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Preview:</h3>
        <div className="p-4 border rounded">
          <LatexRenderer latex={editedProblem} />
        </div>
      </div>
      {!readOnly && (
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default ProblemEditor;
