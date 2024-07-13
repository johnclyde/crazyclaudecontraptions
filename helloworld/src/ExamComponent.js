import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ExamComponent = () => {
  const { competition, year, exam } = useParams();
  const [problems, setProblems] = useState([]);
  const [comment, setComment] = useState('');
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [showAllProblems, setShowAllProblems] = useState(false);

  useEffect(() => {
    // Fetch problems and comment from your API
    // This is a placeholder and should be replaced with actual API calls
    const fetchExamData = async () => {
      // const response = await fetch(`/api/competition/${competition}/${year}/${exam}`);
      // const data = await response.json();
      // setProblems(data.problems);
      // setComment(data.comment);

      // Placeholder data
      setProblems([
        { number: 1, problem: "What is 2 + 2?", image_url: null },
        { number: 2, problem: "Solve for x: 2x + 3 = 7", image_url: null },
        { number: 3, problem: "What is the area of a circle with radius 5?", image_url: null },
      ]);
      setComment("This is a sample exam comment.");
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

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">{`${competition} - ${year} - ${exam}`}</h1>
      <p className="mb-4">{comment}</p>

      {problems.length > 0 ? (
        <>
          <div className="flex justify-between mb-4">
            <button 
              onClick={handlePrevious}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
              disabled={currentProblemIndex === 0}
            >
              ← Previous
            </button>
            <button 
              onClick={toggleView}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              {showAllProblems ? "Show One Problem" : "Show All Problems"}
            </button>
            <button 
              onClick={handleNext}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
              disabled={currentProblemIndex === problems.length - 1}
            >
              Next →
            </button>
          </div>

          <ul className="space-y-4">
            {(showAllProblems ? problems : [problems[currentProblemIndex]]).map((problem, index) => (
              <li key={index} className="bg-white p-4 rounded shadow">
                <strong>Problem {problem.number}:</strong> <span>{problem.problem}</span>
                {problem.image_url && (
                  <img src={problem.image_url} alt={`Problem ${problem.number}`} className="mt-2" />
                )}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>No problems available for this exam.</p>
      )}
    </div>
  );
};

export default ExamComponent;
