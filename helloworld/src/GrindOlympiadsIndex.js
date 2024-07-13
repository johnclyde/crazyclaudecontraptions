import React, { useState, useEffect } from 'react';
import './GrindOlympiadsIndex.css';

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

  return (
    <div>
      <header className="header">
        <nav className="nav">
          <div className="logo">GrindOlympiads</div>
        </nav>
      </header>

      <div className="hero">
        <h1 className="hero-title">Welcome to GrindOlympiads!</h1>
        <button
          onClick={() => setShowTests(!showTests)}
          className="button"
        >
          {showTests ? 'Hide Tests' : 'View Tests'}
        </button>
      </div>

      {showTests && (
        <div className="container">
          {loading ? (
            <p>Loading tests...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : (
            <div className="grid">
              {tests.map((test, index) => (
                <div key={index} className="card">
                  <div className="card-content">
                    <h3 className="card-title">{test.competition}</h3>
                    <p className="card-subtitle">{`${test.year} - ${test.exam}`}</p>
                    <a
                      href={`/competition/${test.competition}/${test.year}/${test.exam}`}
                      className="card-button"
                    >
                      Take Test
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GrindOlympiadsIndex;
