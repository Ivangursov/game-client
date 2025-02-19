import { useState, useEffect } from "react";
import { Button, TextField, Card, CardContent } from "@mui/material";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

export default function Game() {
  const [playerName, setPlayerName] = useState("");
  const [isNameSet, setIsNameSet] = useState(false);
  const [letter, setLetter] = useState("");
  const [answers, setAnswers] = useState({ country: "", city: "", village: "", river: "", object: "", animal: "", plant: "", name: "" });
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    socket.on("roundEnded", () => {
      setSubmitted(true);
    });
    socket.on("updatePlayers", (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    socket.on("newRound", (newLetter) => {
      setLetter(newLetter);
      setSubmitted(false);
      setAnswers({ country: "", city: "", village: "", river: "", object: "", animal: "", plant: "", name: "" });
      setScore(0);
    });
  }, []);

  const handleNameSubmit = () => {
    setIsNameSet(true);
    socket.emit("joinGame", playerName);
  };

  const generateLetter = () => {
    if (!submitted) {  
      socket.emit("startNewRound");
    }
  };

  const handleChange = (e) => {
    setAnswers({ ...answers, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    let newScore = Object.values(answers).reduce((acc, val) => (val ? acc + 10 : acc), 0);
    setScore(newScore);
    setSubmitted(true);
    socket.emit("submitScore", { name: playerName, score: newScore });
  };

  if (!isNameSet) {
    return (
      <div className="flex flex-col items-center p-5 space-y-4">
        <h1 className="text-2xl font-bold">Въведи име</h1>
        <TextField label="Вашето име" value={playerName} onChange={(e) => setPlayerName(e.target.value)} />
        <Button variant="contained" onClick={handleNameSubmit}>Запази име</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-5 space-y-4">
      <h1 className="text-2xl font-bold">Държави, Градове, Села и Още</h1>
      <h2 className="text-lg font-semibold">Играч: {playerName}</h2>
      <Button variant="contained" onClick={generateLetter}>Генерирай буква</Button>
      {letter && <h2 className="text-xl font-semibold">Буква: {letter}</h2>}
      <div className="grid grid-cols-1 gap-4 w-full max-w-md">
        {Object.keys(answers).map((key) => (
          <TextField key={key} name={key} label={key} value={answers[key]} onChange={handleChange} />
        ))}
      </div>
      <Button variant="contained" onClick={handleSubmit}>Изпрати</Button>
      {submitted && (
        <Card className="p-4 mt-4">
          <CardContent>
            <h2 className="text-xl font-bold mt-2">Точки: {score}</h2>
          </CardContent>
        </Card>
      )}
      <div className="mt-6">
        <h2 className="text-lg font-semibold">Класация:</h2>
        {players.map((player, index) => (
          <p key={index}>{player.name}: {player.score} точки</p>
        ))}
      </div>
    </div>
  );
}
