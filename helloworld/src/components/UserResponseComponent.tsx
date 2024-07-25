
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import LatexRenderer from './LatexRenderer';

const OptionButton = ({ option, selected, onClick, latex }) => (
  <button
    onClick={onClick}
    className={`p-2 m-1 border rounded ${selected ? 'bg-green-200' : 'bg-white'}`}
  >
    {option}. <LatexRenderer latex={latex} />
  </button>
);

const MultipleChoiceProblem = ({ problem, onAnswer }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    onAnswer(problem.id, option);
  };

  const options = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="mb-4">
      <h3 className="font-bold mb-2">Problem {problem.number}</h3>
      <LatexRenderer latex={problem.question} />
      <div className="mt-2">
        {options.map((option) => (
          <OptionButton
            key={option}
            option={option}
            selected={selectedOption === option}
            onClick={() => handleOptionClick(option)}
            latex={problem.options[option]}
          />
        ))}
      </div>
    </div>
  );
};

const UserResponseComponent = () => {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [responses, setResponses] = useState({});

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await fetch(`/api/exams/${examId}`);
        if (response.ok) {
          const data = await response.json();
          setExam(data);
        } else {
          console.error('Failed to fetch exam');
        }
      } catch (error) {
        console.error('Error fetching exam:', error);
      }
    };

    fetchExam();
  }, [examId]);

  const handleAnswer = async (problemId, answer) => {
    setResponses(prev => ({...prev, [problemId]: answer}));

    try {
      const response = await fetch('/api/submit-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ examId, problemId, answer }),
      });
      if (!response.ok) {
        console.error('Failed to submit answer');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  if (!exam) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{exam.title}</h2>
      {exam.isMultipleChoice ? (
        exam.problems.map(problem => (
          <MultipleChoiceProblem
            key={problem.id}
            problem={problem}
            onAnswer={handleAnswer}
          />
        ))
      ) : (
        // Render non-multiple choice problems here
        <div>Non-multiple choice problems not implemented yet</div>
      )}
    </div>
  );
};

export default UserResponseComponent;
