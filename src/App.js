
import './App.css';
import React, { useState, useEffect } from "react";

function App() {
  const [generatedCode, setGeneratedCode] = useState("");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    fetchGeneratedCode(); // Initial code fetch

    // Start a timer to generate a new code every 60 seconds
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 0) {
          fetchGeneratedCode();
          return 60;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval); // Cleanup the interval on component unmount
  }, []);

  const fetchGeneratedCode = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/codes"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      setGeneratedCode(result.code);
    } catch (error) {
      console.error("Error fetching generated code:", error);
    }
  };

  const submitCode = async () => {
    try {
      setLoading(true);
      setOutput("Loading...");

      const response = await fetch(
        "http://localhost:5000/api/codes/use",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        setOutput(result.message);
      } else if (response.status === 400) {
        const result = await response.json();
        setOutput(result.error);
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error during API request:", error);
      setOutput("An error occurred during the API request.");
    } finally {
      setLoading(false);
    }
  };

  const generateNewCode = () => {
    setTimer(60); // Reset the timer
    fetchGeneratedCode();
  };

  return (
    <div className="App">
      <h2>Code Validation App</h2>

      <div>
        <p>Generated Code: {generatedCode}</p>
        <p>Timer: {timer} seconds</p>
        <button onClick={generateNewCode} disabled={loading}>
          Generate New Code
        </button>
      </div>

      <div>
        <p>Enter Code:</p>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={loading}
        />
        <button onClick={submitCode} disabled={loading}>
          Submit
        </button>
        <div id="output">{loading ? "Loading..." : output}</div>
      </div>
    </div>
  );
}

export default App;
