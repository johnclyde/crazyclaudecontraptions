import { useState, useEffect, useMemo } from "react";

const useTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompetition, setSelectedCompetition] = useState("All");

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://us-central1-olympiads.cloudfunctions.net/exams",
      );
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
