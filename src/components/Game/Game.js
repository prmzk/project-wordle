import React, { useState } from "react";

import { range, sample } from "../../utils";
import { WORDS } from "../../data";
import { NUM_OF_GUESSES_ALLOWED, NUM_OF_GAME, KEYS } from "../../constants";
import { checkGuess } from "../../game-helpers";

const YouWin = ({
  setGameStatus,
  shiftAnswer,
  setGuesses,
  guessesLength,
  setLetterGuesses,
  answersLength,
}) => (
  <div className="happy banner">
    <p>
      <strong>Congratulations!</strong> Got it in{" "}
      <strong>{guessesLength} guesses</strong>.
    </p>
    {answersLength > 1 && (
      <button
        onClick={() => {
          setGameStatus("playing");
          shiftAnswer();
          setGuesses([]);
          setLetterGuesses([]);
        }}
      >
        Reset
      </button>
    )}
  </div>
);
const YouLose = ({ answer, setGameStatus, setGuesses, setLetterGuesses }) => (
  <div className="sad banner">
    <p>
      Sorry, the correct answer is <strong>{answer}</strong>.
    </p>
    <button
      onClick={() => {
        setGameStatus("playing");
        setGuesses([]);
        setLetterGuesses([]);
      }}
    >
      Try Again
    </button>
  </div>
);

// Pick a random word on every pageload.
// To make debugging easier, we'll log the solution in the console.

function Game() {
  const [answers, setAnswers] = useState(() => {
    const tempAnswers = [];
    range(NUM_OF_GAME).forEach(() => {
      tempAnswers.push(sample(WORDS));
    });
    return tempAnswers;
  });
  const [gameStatus, setGameStatus] = useState("playing");
  const [guesses, setGuesses] = useState([]);
  const [letterGuesses, setLetterGuesses] = useState([]);
  const [guess, setGuess] = useState("");

  const shiftAnswer = () => {
    const newAnswers = [...answers];
    newAnswers.shift();
    setAnswers(newAnswers);
  };

  const getLetterColor = (letter) => {
    const letterFound = letterGuesses.find((el) => el.letter === letter);
    if (letterFound?.status === "misplaced") return "#998000";
    if (letterFound?.status === "correct") return "#17824d";
    if (letterFound?.status === "incorrect") return "#404040";
    return "#bfbfbf";
  };

  console.log({ answers });

  return (
    <>
      <div className="guess-results">
        {guesses.map((el) => {
          const id = crypto.randomUUID();
          return (
            <p className="guess" key={id}>
              {el.map((cell, i) => (
                <span key={`${id}_${i}`} className={`cell ${cell.status}`}>
                  {cell.letter}
                </span>
              ))}
            </p>
          );
        })}
        {range(NUM_OF_GUESSES_ALLOWED - guesses.length).map(() => {
          const id = crypto.randomUUID();
          return (
            <p className="guess" key={id}>
              {range(5).map((_, i) => (
                <span key={`${id}_${i}`} className="cell"></span>
              ))}
            </p>
          );
        })}
      </div>
      <form
        className="guess-input-wrapper"
        onSubmit={(e) => {
          e.preventDefault();

          if (guess.length === 5) {
            const checkedGuess = checkGuess(guess, answers[0]);
            const tempLetterGuesses = [...letterGuesses];
            checkGuess(guess, answers[0]).forEach((el) => {
              const letterIndex = tempLetterGuesses
                .map((letterGuess) => letterGuess.letter)
                .indexOf(el.letter);
              if (letterIndex >= 0) {
                tempLetterGuesses[letterIndex].status = el.status;
              } else {
                tempLetterGuesses.push(el);
              }
            });
            setLetterGuesses(tempLetterGuesses);

            setGuesses((prev) => [...prev, checkedGuess]);
            setGuess("");
            if (guess === answers[0]) {
              setGameStatus("win");
            } else if (guesses.length + 1 >= NUM_OF_GUESSES_ALLOWED) {
              setGameStatus("lose");
            }
          }
        }}
      >
        <label htmlFor="guess-input">Enter guess:</label>
        <input
          id="guess-input"
          type="text"
          value={guess}
          disabled={gameStatus !== "playing"}
          onChange={(e) => {
            if (e.target.value.length <= 5) {
              setGuess(e.target.value.toUpperCase());
            }
          }}
        />
      </form>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          placeItems: "center",
        }}
      >
        {KEYS.map((row) => (
          <div key={row} style={{ display: "flex", gap: 4 }}>
            {row.split("").map((keyboardKey) => (
              <p
                key={`${row}_${keyboardKey}`}
                style={{
                  padding: "4px 8px",
                  background: getLetterColor(keyboardKey),
                  borderRadius: 8,
                  color: "white",
                }}
              >
                {keyboardKey}
              </p>
            ))}
          </div>
        ))}
      </div>
      {gameStatus === "win" && (
        <YouWin
          setGameStatus={setGameStatus}
          setGuesses={setGuesses}
          shiftAnswer={shiftAnswer}
          guessesLength={guesses.length}
          setLetterGuesses={setLetterGuesses}
          answersLength={answers.length}
        />
      )}
      {gameStatus === "lose" && (
        <YouLose
          setGameStatus={setGameStatus}
          setGuesses={setGuesses}
          setLetterGuesses={setLetterGuesses}
          answer={answers[0]}
        />
      )}
    </>
  );
}

export default Game;
