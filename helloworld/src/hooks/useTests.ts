import { useState, useEffect, useMemo } from "react";

interface Test {
  competition: string;
  year: string;
  exam: string;
}

interface UseTestsReturn {
  tests: Test[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCompetition: string;
  setSelectedCompetition: (competition: string) => void;
  filteredTests: Test[];
}

const useTests = (): UseTestsReturn => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCompetition, setSelectedCompetition] = useState<string>("All");

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/exams");
      if (!response.ok) {
        throw new Error("Failed to fetch tests");
      }
      const data = await response.json();
      setTests(data.tests || []);
    } catch (err) {
      console.error("Error fetching tests:", err);
      setError("Failed to load tests. Please try refreshing the page.");
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = useMemo(() => {
    return tests.filter(
      (test) =>
        (selectedCompetition === "All" ||
          test.competition === selectedCompetition) &&
        (test.competition.toLowerCase().includes(searchTerm.toLowerCase()) ||
          test.exam.toLowerCase().includes(searchTerm.toLowerCase()) ||
          test.year.includes(searchTerm)),
    );
  }, [tests, selectedCompetition, searchTerm]);

  return {
    tests,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedCompetition,
    setSelectedCompetition,
    filteredTests,
  };
};

export default useTests;
