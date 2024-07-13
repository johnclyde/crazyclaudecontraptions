import React, { useState, useEffect } from 'react';
import GrindOlympiadsLayout from './GrindOlympiadsLayout';

const GrindOlympiadsIndex = () => {
  const [showTests, setShowTests] = useState(false);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (showTests) {
      fetchTests();
    }
  }, [showTests]);

  const fetchTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://us-central1-olympiads.cloudfunctions.net/exams');
      if (!response.ok) {
        throw new Error('Failed to fetch tests');
      }
      const data = await response.json();
      setTests(data.tests || []);
    } catch (err) {
      setError('Failed to load tests. Please try again later.');
      console.error('Error fetching tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTests = () => {
    setShowTests(!showTests);
  };

  return (
    <GrindOlympiadsLayout>
      <header className="text-center py-10 bg-white">
        <h1 className="text-4xl font-bold mb-4">Welcome to GrindOlympiads!</h1>
        <button
          onClick={toggleTests}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          View Tests
        </button>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        {showTests && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Available Tests</h2>
            {loading ? (
              <p>Loading tests...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : tests.length > 0 ? (
              <ul className="space-y-2">
                {tests.map((test, index) => (
                  <li key={index}>
                    <a
                      href={`/competition/${test.competition}/${test.year}/${test.exam}`}
                      className="text-blue-500 hover:underline"
                    >
                      {`${test.competition} - ${test.year} - ${test.exam}`}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No tests available at the moment. Please check back later.</p>
            )}
          </section>
        )}
      </main>
      <footer className="bg-gray-200 text-center p-4">
        <p>&copy; 2024 Grind Olympiads. All rights reserved.</p>
        <p className="text-sm text-gray-600">Build Version: 1.0.0</p>
      </footer>
    </GrindOlympiadsLayout>
  );
};

export default GrindOlympiadsIndex;
