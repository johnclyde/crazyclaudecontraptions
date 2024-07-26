import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import LatexRenderer from "./LatexRenderer";
import ProblemEditor, { Problem } from "./ProblemEditor";
import { getIdToken } from "../firebase";
import { useUserDataContext } from "../contexts/UserDataContext";

const ExamComponent: React.FC = () => {
  const { competition, year, exam } = useParams<{
    competition: string;
    year: string;
    exam: string;
  }>();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [comment, setComment] = useState("");
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [showAllProblems, setShowAllProblems] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [examId, setExamId] = useState<string | null>(null);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);

  const { user, isAdminMode } = useUserDataContext();

  useEffect(() => {
    const fetchExamData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/exam?competition=${competition}&year=${year}&exam=${exam}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch exam data");
        }
        const data = await response.json();
        setProblems(data.problems || []);
        setComment(data.comment || "");
        setExamId(data.examId || null);
        setError(null);
      } catch (err) {
        console.error("Error fetching exam data:", err);
        setError("Failed to load exam data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [competition, year, exam]);

  const handlePrevious = () => {
    setCurrentProblemIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentProblemIndex((prev) => Math.min(problems.length - 1, prev + 1));
  };

  const toggleView = () => {
    setShowAllProblems((prev) => !prev);
  };

  const handleEditProblem = (problem: Problem) => {
    setEditingProblem(problem);
  };

  const handleSaveProblem = async (updatedProblem: Problem) => {
    try {
      const response = await fetch(`/api/problem/${updatedProblem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getIdToken()}`,
        },
        body: JSON.stringify(updatedProblem),
      });

      if (!response.ok) {
        throw new Error("Failed to update problem");
      }

      setProblems(
        problems.map((p) => (p.id === updatedProblem.id ? updatedProblem : p)),
      );
      setEditingProblem(null);
    } catch (err) {
      console.error("Error updating problem:", err);
      setError("Failed to update problem. Please try again.");
    }
  };

  const renderProblem = (problem: Problem) => (
    <li key={problem.id} className="bg-white p-4 rounded shadow">
      <strong className="text-lg">Problem {problem.number}:</strong>
      <div className="mt-2">
        <LatexRenderer latex={problem.problem} />
      </div>
      {problem.image_url && (
        <img
          src={`/images/${problem.image_url}`}
          alt="Problem illustration"
          className="mt-2 max-w-full h-auto"
        />
      )}
      {isAdminMode && user?.isAdmin && (
        <button
          onClick={() => handleEditProblem(problem)}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Edit Problem
        </button>
      )}
    </li>
  );

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading exam data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  if (editingProblem) {
    return (
      <ProblemEditor
        problem={editingProblem}
        onSave={handleSaveProblem}
        onCancel={() => setEditingProblem(null)}
      />
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">{`${competition} - ${year} - ${exam}`}</h1>
      <p className="mb-4">{comment}</p>

      {examId && (
        <Link
          to={`/exam/${examId}/respond`}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors mb-4 inline-block"
        >
          Start Exam
        </Link>
      )}

      {problems.length > 0 ? (
        <>
          <div className="flex justify-between mb-4">
            {!showAllProblems && (
              <button
                onClick={handlePrevious}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
                disabled={currentProblemIndex === 0}
              >
                ← Previous
              </button>
            )}
            <button
              onClick={toggleView}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              {showAllProblems ? "Show One Problem" : "Show All Problems"}
            </button>
            {!showAllProblems && (
              <button
                onClick={handleNext}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
                disabled={currentProblemIndex === problems.length - 1}
              >
                Next →
              </button>
            )}
          </div>

          <ul className="space-y-4">
            {problems.map((problem, index) => (
              <React.Fragment key={problem.id}>
                {(showAllProblems || index === currentProblemIndex) &&
                  renderProblem(problem)}
              </React.Fragment>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-xl">No problems available for this exam.</p>
      )}
    </div>
  );
};

export default ExamComponent;
