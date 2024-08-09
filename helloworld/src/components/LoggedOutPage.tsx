import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserDataContext } from '../contexts/UserDataContext';

const LoggedOutPage: React.FC = () => {
  const { login } = useUserDataContext();
  const navigate = useNavigate();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [currentSection, setCurrentSection] = useState(0);

  const competitions = [
    "AMC 8", "AMC 10", "AMC 12", "AIME", "USAJMO", "USAMO", "IMO", "Putnam"
  ];

  const handleGoalSelection = (goal: string) => {
    setSelectedGoals(prev => 
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const handleNextSection = () => {
    setCurrentSection(prev => prev + 1);
  };

  const createPlanCard = (title: string, description: string) => (
    <div className="plan-card">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );

  const renderPlan = () => {
    let planHTML = [];
    
    if (selectedGoals.some(goal => ["USAMO", "IMO", "Putnam"].includes(goal))) {
      planHTML.push(
        <div key="advanced" className="advanced-message">
          <h3>Congratulations on your advanced goals!</h3>
          <p>While GrindOlympiads is an excellent resource for many math competitions, your needs are at a very advanced level. We recommend using the following resources that are better suited for your goals:</p>
          <ul>
            <li><strong>Art of Problem Solving (AoPS):</strong> Offers in-depth courses and a vibrant community for high-level problem solving.</li>
            <li><strong>MathDash:</strong> Provides intensive training and real-time competitions for advanced math students.</li>
          </ul>
          <p>These platforms offer the depth and rigor needed for USAMO, IMO, and Putnam preparation. Best of luck in your mathematical journey!</p>
        </div>
      );
    } else {
      if (selectedGoals.includes("AMC 8")) {
        planHTML.push(createPlanCard("AMC 8 Preparation", "Focus on arithmetic, basic algebra, and geometry. Solve AMC 8 style problems daily and take weekly mock tests."));
      }
      if (selectedGoals.includes("AMC 10") || selectedGoals.includes("AMC 12")) {
        planHTML.push(createPlanCard("AMC 10/12 Strategy", "Deepen understanding of algebra, geometry, and precalculus. Practice with past AMC problems and develop time management skills."));
      }
      if (selectedGoals.includes("AIME")) {
        planHTML.push(createPlanCard("AIME Techniques", "Master advanced problem-solving techniques. Work on past AIME problems and focus on the unique strategies required."));
      }
      if (selectedGoals.includes("USAJMO")) {
        planHTML.push(createPlanCard("USAJMO Preparation", "Engage with olympiad-style problems. Study advanced topics in number theory, algebra, combinatorics, and geometry."));
      }
    }
    
    return planHTML;
  };

  return (
    <>
      <header className="header">
        <div className="logo">GrindOlympiads</div>
        <button className="login-btn" onClick={login}>Log In</button>
      </header>
      
      <section className="hero">
        <h1>Personalized Math Competition Training</h1>
        <p>Your tailored path to math competition success. Set your goals, track your progress, and excel in AMC, AIME, and beyond.</p>
      </section>
      
      <main className="content">
        <div className={`section ${currentSection === 0 ? 'visible' : ''}`} id="goal-section">
          <h2>What contests do you plan to participate in this year?</h2>
          <div className="btn-group">
            {competitions.map(comp => (
              <button 
                key={comp}
                className={`choice-btn ${selectedGoals.includes(comp) ? 'selected' : ''}`}
                onClick={() => handleGoalSelection(comp)}
              >
                {comp}
              </button>
            ))}
          </div>
          <button className="next-btn" onClick={handleNextSection}>Next: View Your Personalized Plan</button>
        </div>

        <div className={`section ${currentSection === 1 ? 'visible' : ''}`} id="plan-section">
          <h2>Your Personalized Plan</h2>
          <div id="plan-result">{renderPlan()}</div>
          <button className="next-btn" onClick={handleNextSection}>Next: View Competition Calendar</button>
        </div>

        <div className={`section ${currentSection === 2 ? 'visible' : ''}`} id="calendar-section">
          <h2>Upcoming Math Competitions</h2>
          <div className="calendar">
            <div className="calendar-event">
              <strong>November 15, 2024</strong>
              <p>AMC 10/12 A</p>
            </div>
            <div className="calendar-event">
              <strong>November 22, 2024</strong>
              <p>AMC 10/12 B</p>
            </div>
            <div className="calendar-event">
              <strong>January 30, 2025</strong>
              <p>AIME I</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default LoggedOutPage;
