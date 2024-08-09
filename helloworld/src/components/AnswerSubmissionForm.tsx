import React, { useState } from "react";

interface AnswerSubmissionFormProps {
  problemId: string;
  examId: string;
  onSubmit: (
    examId: string,
    problemId: string,
    answer: string,
  ) => Promise<void>;
}

const AnswerSubmissionForm: React.FC<AnswerSubmissionFormProps> = ({
  problemId,
  examId,
  onSubmit,
}) => {
  const [answer, setAnswer] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(examId, problemId, answer);
    setAnswer(""); // Clear the input after submission
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Enter your answer"
        className="w-full p-2 border rounded"
      />
      <button
        type="submit"
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
      >
        Submit Answer
      </button>
    </form>
  );
};

export default AnswerSubmissionForm;
