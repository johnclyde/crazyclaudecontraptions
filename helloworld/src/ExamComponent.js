import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import GrindOlympiadsLayout from './GrindOlympiadsLayout';

const ExamComponent = () => {
  const { competition, year, exam } = useParams();
  const [problems, setProblems] = useState([]);
  const [comment, setComment] = useState('');
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [showAllProblems, setShowAllProblems] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExamData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://prod.grindolympiads.com/api/competition/${competition}/${year}/${exam}`);
        if (!response.ok) {
          throw new Error('Failed to fetch exam data');
        }
        const data = await response.json();
        setProblems(data.problems || []);
        setComment(data.comment || '');
        setError(null);
      } catch (err) {
        console.error('Error fetching exam data:', err);
        setError('Failed to load exam data. Please try again later.');
      } finally {
        setLoading(false);
      }

      fetchExamData();
    }, [competition, year, exam]);

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

  const renderImage = (imageUrl) => {
    if (!imageUrl) return null;
    return <img src={`https://prod.grindolympiads.com/api${imageUrl}`} alt="Problem illustration" className="mt-2 max-w-full h-auto" />;
  };

  if (loading) {
    return (
      <GrindOlympiadsLayout>
        <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
          <p className="text-xl">Loading exam data...</p>
        </div>
      </GrindOlympiadsLayout>
    );
  }

  if (error) {
    return (
      <GrindOlympiadsLayout>
        <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
          <p className="text-xl text-red-500">{error}</p>
        </div>
      </GrindOlympiadsLayout>
    );
  }

  return (
    <GrindOlympiadsLayout>
      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-4">{`${competition} - ${year} - ${exam}`}</h1>
        <p className="mb-4">{comment}</p>

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
              {(showAllProblems ? problems : [problems[currentProblemIndex]]).map((problem, index) => (
                <li key={index} className="bg-white p-4 rounded shadow">
                  <strong className="text-lg">Problem {problem.number}:</strong>
                  <div className="mt-2" dangerouslySetInnerHTML={{ __html: problem.problem }} />
                  {renderImage(problem.image_url)}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-xl">No problems available for this exam.</p>
        )}
      </div>
    </GrindOlympiadsLayout>
  );
};

export default ExamComponent;
