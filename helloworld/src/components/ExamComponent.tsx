import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import LatexRenderer from "./LatexRenderer";

interface Problem {
  number: number;
  problem: string;
  image_url?: string;
}

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

  // ... (rest of the component code remains the same)

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

      {/* ... (rest of the JSX remains the same) */}
    </div>
  );
};

export default ExamComponent;
