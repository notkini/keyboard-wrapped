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

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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

  const login = async (isRegister = false) => {
    const endpoint = isRegister ? "register" : "login";

    const res = await fetch(`http://localhost:5000/auth/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
    } else if (data.success) {
      alert("Registered. Now login.");
    } else {
      alert(data.error);
    }
  };

  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`
        };

        const summaryRes = await fetch("http://localhost:5000/api/summary", {
          headers
        });
        setSummary(await summaryRes.json());

        const keysRes = await fetch("http://localhost:5000/api/top-keys", {
          headers
        });
        setTopKeys(await keysRes.json());

        const personalityRes = await fetch(
          "http://localhost:5000/api/personality",
          { headers }
        );
        const pData = await personalityRes.json();
        setPersonality(pData.personality);
      } catch {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        setToken(null);
      }
    };

    loadData();
  }, [token]);

  useEffect(() => {
    if (step >= 1 && step < totalSteps) {
      const timer = setTimeout(() => {
        setStep(prev => prev + 1);
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [step, totalSteps]);

  if (!token) {
    return (
      <div className="screen">
        <div className="card">
          <h1>Keyboard Wrapped</h1>
          <input
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button onClick={() => login(false)}>Login</button>
          <button onClick={() => login(true)}>Register</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app" style={{ backgroundColor: backgrounds[step] }}>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {step === 0 && (
        <div className="screen">
          <div className="card">
            <h1>Welcome back</h1>
            <p>Your typing story is loading</p>
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
            <div className="big">{summary.most_active_hour}:00</div>
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
          </div>
        </div>
      )}

      {step >= 5 && (
        <div className="screen">
          <div className="card">
            <h1>That’s your Keyboard Wrapped</h1>
            <p>Logout and come back tomorrow</p>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                setToken(null);
                setStep(0);
              }}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
