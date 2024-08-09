import React, { useState } from "react";
import AnswerSubmissionForm from "./AnswerSubmissionForm";
import useExam from "../hooks/useExam";

const ExamComponent: React.FC = () => {
  const { exam, loading, error, submitAnswer } = useExam();
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!exam) return <div>No exam data available.</div>;

  const currentProblem = exam.problems[currentProblemIndex];

  return (
    <div>
      <h1>{exam.title}</h1>
      <div>
        <h2>Problem {currentProblem.number}</h2>
        <p>{currentProblem.question}</p>
        <AnswerSubmissionForm
          problemId={currentProblem.id}
          examId={exam.id}
          onSubmit={submitAnswer}
        />
      </div>
      <button
        onClick={() => setCurrentProblemIndex((prev) => Math.max(0, prev - 1))}
      >
        Previous
      </button>
      <button
        onClick={() =>
          setCurrentProblemIndex((prev) =>
            Math.min(exam.problems.length - 1, prev + 1),
          )
        }
      >
        Next
      </button>
    </div>
  );
};

export default ExamComponent;
