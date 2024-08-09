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
      />
      <button type="submit">Submit Answer</button>
    </form>
  );
};

export default AnswerSubmissionForm;
