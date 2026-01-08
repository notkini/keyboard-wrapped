import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [step, setStep] = useState(0);
  const [summary, setSummary] = useState(null);
  const [topKeys, setTopKeys] = useState([]);
  const [personality, setPersonality] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/summary")
      .then(res => res.json())
      .then(data => setSummary(data));

    fetch("http://localhost:5000/api/top-keys")
      .then(res => res.json())
      .then(data => setTopKeys(data));

    fetch("http://localhost:5000/api/personality")
      .then(res => res.json())
      .then(data => setPersonality(data.personality));
  }, []);

  useEffect(() => {
    if (step === 0) {
      const timer = setTimeout(() => setStep(1), 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const next = () => setStep(prev => prev + 1);

  return (
    <div className="app">
      {step === 0 && (
        <div className="screen center">
          <h1>Keyboard Wrapped</h1>
          <p>Preparing your year in keys...</p>
        </div>
      )}

      {step === 1 && summary && (
        <div className="screen">
          <h2>You pressed</h2>
          <div className="big">{summary.total_keys}</div>
          <p>keys this session</p>
          <button onClick={next}>Next</button>
        </div>
      )}

      {step === 2 && summary && (
        <div className="screen">
          <h2>Your most active hour</h2>
          <div className="big">{summary.most_active_hour}:00</div>
          <p>You were locked in.</p>
          <button onClick={next}>Next</button>
        </div>
      )}

      {step === 3 && topKeys.length > 0 && (
        <div className="screen">
          <h2>Your top keys</h2>
          <ul>
            {topKeys.slice(0, 5).map(item => (
              <li key={item.key}>
                {item.key} — {item.count}
              </li>
            ))}
          </ul>
          <button onClick={next}>Next</button>
        </div>
      )}

      {step === 4 && personality && (
        <div className="screen">
          <h2>Your typing personality</h2>
          <div className="big">{personality}</div>
          <button onClick={next}>Finish</button>
        </div>
      )}

      {step >= 5 && (
        <div className="screen center">
          <h1>That’s your Keyboard Wrapped</h1>
          <p>See you next year.</p>
        </div>
      )}
    </div>
  );
}

export default App;
