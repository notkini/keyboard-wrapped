import React, { useEffect, useState } from "react";
import "./App.css";

function AnimatedNumber({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!value || value <= 0) {
      setDisplay(0);
      return;
    }

    let start = 0;
    const stepTime = Math.max(Math.floor(duration / value), 20);

    const timer = setInterval(() => {
      start += 1;
      setDisplay(start);
      if (start >= value) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <div className="big">{display}</div>;
}

function App() {
  const [step, setStep] = useState(0);
  const [summary, setSummary] = useState(null);
  const [topKeys, setTopKeys] = useState([]);
  const [personality, setPersonality] = useState("");

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const backgrounds = [
    "#020617",
    "#1e1b4b",
    "#052e16",
    "#3b0764",
    "#1f2933",
    "#020617"
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const summaryRes = await fetch("http://localhost:5000/api/summary");
        const summaryData = await summaryRes.json();
        setSummary(summaryData);

        const keysRes = await fetch("http://localhost:5000/api/top-keys");
        const keysData = await keysRes.json();
        setTopKeys(keysData);

        const personalityRes = await fetch("http://localhost:5000/api/personality");
        const personalityData = await personalityRes.json();
        setPersonality(personalityData.personality);
      } catch (err) {
        console.error("Backend not reachable", err);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (step >= 1 && step < totalSteps) {
      const timer = setTimeout(() => {
        setStep(prev => prev + 1);
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [step, totalSteps]);

  return (
    <div
      className="app"
      style={{ backgroundColor: backgrounds[step] }}
    >
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {step === 0 && (
        <div className="screen">
          <div className="card">
            <h1>Keyboard Wrapped</h1>
            <p>Preparing your typing story</p>
          </div>
        </div>
      )}

      {step === 1 && summary && (
        <div className="screen">
          <div className="card">
            <h2>You pressed</h2>
            <AnimatedNumber value={summary.total_keys} />
            <p>keys this session</p>
          </div>
        </div>
      )}

      {step === 2 && summary && (
        <div className="screen">
          <div className="card">
            <h2>Your most active hour</h2>
            <div className="big">
              {summary.most_active_hour}:00
            </div>
            <p>You were locked in</p>
          </div>
        </div>
      )}

      {step === 3 && topKeys.length > 0 && (
        <div className="screen">
          <div className="card">
            <h2>Your top keys</h2>
            <ul>
              {topKeys.slice(0, 5).map(item => (
                <li key={item.key}>
                  {item.key.toUpperCase()} — {item.count}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {step === 4 && personality && (
        <div className="screen">
          <div className="card">
            <h2>Your typing personality</h2>
            <div className="big">{personality}</div>
            <p>This says a lot about how you work</p>
          </div>
        </div>
      )}

      {step >= 5 && (
        <div className="screen">
          <div className="card">
            <h1>That’s your Keyboard Wrapped</h1>
            <p>See you next session</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
