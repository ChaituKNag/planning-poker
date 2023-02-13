import React, { useLayoutEffect } from "react";
import { useParams } from "react-router-dom";
import { getIo } from "../api";
import { Game } from "../interfaces";

const GameHome = () => {
  const { gameId } = useParams();
  const [game, setGame] = React.useState<Game>();

  useLayoutEffect(() => {
    if (gameId && !game) {
      const io = getIo();
      const userStorage = localStorage.getItem("user");
      if (userStorage) {
        const user = JSON.parse(userStorage);

        io.emit("join game", { gameId, userId: user?.id });

        io.once("game not found", () => {
          console.log("game not found");
        });

        io.once("joined game", ({ game, userId }) => {
          console.log("joined game", game, userId);
          setGame(game);
        });

        io.on("user joined", ({ game, userId }) => {
          console.log("joined game", game, userId);
          setGame(game);
        });
      }
    }
  }, [gameId, game]);

  return (
    <div>
      <h2>GameHome - {gameId}</h2>
      <p>Game: {game?.name}</p>
    </div>
  );
};

export default GameHome;
