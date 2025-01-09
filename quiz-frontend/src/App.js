import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:4000'); // Connect to the backend

function App() {
  const [username, setUsername] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [subject, setSubject] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [leaderboards, setLeaderboards] = useState({ Math: [], Science: [] });

  // Questions for the quiz
  const questionsData = {
    Math: [
      { question: 'What is 2 + 2?', options: ['3', '4'], answer: '4' },
      { question: 'What is 5 - 3?', options: ['2', '3'], answer: '2' },
      { question: 'What is 3 x 3?', options: ['6', '9'], answer: '9' },
      { question: 'What is 10 ÷ 2?', options: ['4', '5'], answer: '5' },
      { question: 'What is 7 + 1?', options: ['8', '9'], answer: '8' },
    ],
    Science: [
      { question: 'What planet do we live on?', options: ['Earth', 'Mars'], answer: 'Earth' },
      { question: 'What do plants need to grow?', options: ['Sunlight', 'Moonlight'], answer: 'Sunlight' },
      { question: 'What is H2O?', options: ['Water', 'Oxygen'], answer: 'Water' },
      { question: 'What do bees make?', options: ['Honey', 'Milk'], answer: 'Honey' },
      { question: 'What organ pumps blood?', options: ['Heart', 'Brain'], answer: 'Heart' },
    ],
  };

  useEffect(() => {
    // Listen for leaderboard updates
    socket.on('updateLeaderboard', (data) => {
      setLeaderboards(data);
    });

    return () => socket.off('updateLeaderboard');
  }, []);

  // Play sound for correct or wrong answers
  const playSound = (type) => {
    const audio = new Audio(
      type === 'correct' ? '/correct.mp3' : '/wrong.mp3'
    );
    audio.play();
  };

  const handleLogin = async () => {
    const response = await fetch('http://localhost:4000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    if (response.ok) {
      setLoggedIn(true);
    } else {
      alert('Login failed');
    }
  };


    //  Handle answer selection
  const handleAnswer = (answer) => {
    const currentQuestion = questionsData[subject][currentQuestionIndex];

    if (currentQuestion.answer === answer) {
      playSound('correct');
      setScore(score + 1);
    } else {
      playSound('wrong');
    }

    if (currentQuestionIndex < questionsData[subject].length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      socket.emit('submitQuiz', { username, score, subject });
      alert(`Quiz completed! Your score: ${score}`);
      setCurrentQuestionIndex(0);
      setScore(0);
      setSubject('');
    }
  };

  return (
    <div style={{ textAlign: 'center', fontFamily: 'Comic Sans MS', padding: '20px' }}>
      <h1 style={{ fontSize: '40px', color: '#FF5733' }}>Quizzo 🧩🧠</h1>
      {!loggedIn ? (
        <div>
          <h2>Enter Your Name</h2>
          <input
            type="text"
            placeholder="Your Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              fontSize: '18px',
              padding: '10px',
              borderRadius: '5px',
              border: '2px solid #FF5733',
            }}
          />
          <button
            onClick={handleLogin}
            style={{
              fontSize: '18px',
              marginLeft: '10px',
              padding: '10px 20px',
              backgroundColor: '#FF5733',
              color: '#FFF',
              border: 'none',
              borderRadius: '5px',
            }}
          >
            Start
          </button>
        </div>
      ) : !subject ? (
        <div>
          <h2>Choose Your Subject</h2>
          <button
            onClick={() => setSubject('Math')}
            style={{
              fontSize: '18px',
              margin: '10px',
              padding: '10px 20px',
              backgroundColor: '#FFC300',
              border: 'none',
              borderRadius: '5px',
            }}
          >
            Math 🧮
          </button>
          <button
            onClick={() => setSubject('Science')}
            style={{
              fontSize: '18px',
              margin: '10px',
              padding: '10px 20px',
              backgroundColor: '#28B463',
              border: 'none',
              borderRadius: '5px',
            }}
          >
            Science 🔬
          </button>
        </div>
      ) : (
        <div>
          <h2>{subject} Quiz</h2>
          <p style={{ fontSize: '20px', margin: '20px' }}>
            {questionsData[subject][currentQuestionIndex].question}
          </p>
          {questionsData[subject][currentQuestionIndex].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              style={{
                fontSize: '18px',
                margin: '10px',
                padding: '10px 20px',
                backgroundColor: '#FF5733',
                color: '#FFF',
                border: 'none',
                borderRadius: '5px',
              }}
            >
              {option}
            </button>
          ))}
          <p>Score: {score}</p>
        </div>
      )}
      <div>
        <h3>Leaderboard - Math</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {leaderboards.Math.map((entry, index) => (
            <li key={index} style={{ fontSize: '18px', margin: '5px' }}>
              {entry.username}: {entry.score}
            </li>
          ))}
        </ul>
        <h3>Leaderboard - Science</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {leaderboards.Science.map((entry, index) => (
            <li key={index} style={{ fontSize: '18px', margin: '5px' }}>
              {entry.username}: {entry.score}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
