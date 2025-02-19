import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
    socket.emit("startNewRound");
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
        <Input placeholder="Вашето име" value={playerName} onChange={(e) => setPlayerName(e.target.value)} />
        <Button onClick={handleNameSubmit}>Запази име</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-5 space-y-4">
      <h1 className="text-2xl font-bold">Държави, Градове, Села и Още</h1>
      <h2 className="text-lg font-semibold">Играч: {playerName}</h2>
      <Button onClick={generateLetter}>Генерирай буква</Button>
      {letter && <h2 className="text-xl font-semibold">Буква: {letter}</h2>}
      <div className="grid grid-cols-1 gap-4 w-full max-w-md">
        <Input name="country" placeholder="Държава" value={answers.country} onChange={handleChange} />
        <Input name="city" placeholder="Град" value={answers.city} onChange={handleChange} />
        <Input name="village" placeholder="Село" value={answers.village} onChange={handleChange} />
        <Input name="river" placeholder="Река" value={answers.river} onChange={handleChange} />
        <Input name="object" placeholder="Предмет" value={answers.object} onChange={handleChange} />
        <Input name="animal" placeholder="Животно" value={answers.animal} onChange={handleChange} />
        <Input name="plant" placeholder="Растение" value={answers.plant} onChange={handleChange} />
        <Input name="name" placeholder="Име" value={answers.name} onChange={handleChange} />
      </div>
      <Button onClick={handleSubmit}>Изпрати</Button>
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
