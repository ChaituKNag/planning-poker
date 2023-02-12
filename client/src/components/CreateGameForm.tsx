import React from "react";
import { getIo } from "../api";
import { v4 as uuid } from "uuid";
import { useNavigate } from "react-router-dom";

interface CreateGameFormProps {
  userId: string;
}

const CreateGameForm: React.FC<CreateGameFormProps> = ({ userId }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleCreateGame = () => {
    console.log("create game");

    if (!inputRef.current || !inputRef.current.value) return;

    const io = getIo();

    io.emit("create game", {
      name: inputRef.current.value,
      admin: userId,
      id: uuid()
    });

    io.once("game created", (game) => {
      console.log("game created", game);
      navigate(`/game/${game.id}`);
    });
  };

  return (
    <div>
      <h3>Create a new game</h3>
      <p>
        <input ref={inputRef} name="game-name" />
      </p>
      <button onClick={handleCreateGame}>create game</button>
    </div>
  );
};

export default CreateGameForm;
