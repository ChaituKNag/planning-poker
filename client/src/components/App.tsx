import { useLayoutEffect, useRef, useState } from "react";
import { getIo } from "../api";
import { v4 as uuid } from "uuid";
import { Game, User } from "../interfaces";
import CreateGameForm from "./CreateGameForm";

function App() {
  const [user, setUser] = useState<{ id: string; name: string } | null>(() => {
    const user = localStorage.getItem("user");
    if (user) {
      return JSON.parse(user);
    }
    return null;
  });
  const [games, setGames] = useState<Game[]>([]);
  const userNameRef = useRef<HTMLInputElement>(null);

  const handleFetchUser = (u: User) => {
    const io = getIo();

    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);

    io.emit("get user games", { userId: u.id });

    io.once("user games", (games) => {
      setGames(games);
    });
  };

  useLayoutEffect(() => {
    if (!user?.id) {
      const io = getIo();
      io.emit("get user", { id: user?.id });
      io.once("user found", (user) => handleFetchUser(user));
    }
  }, [user?.id]);

  const handleCreateUser = () => {
    const io = getIo();
    const userId = uuid();

    io.emit("create user", { name: userNameRef.current?.value, id: userId });

    io.once("user created", (user) => handleFetchUser(user));
    io.once("user exists", (user) => handleFetchUser(user));
  };

  return (
    <div>
      {!user && (
        <div>
          <p>
            Your name <input name="user-name" ref={userNameRef} />
          </p>
          <button onClick={handleCreateUser}>start</button>
        </div>
      )}

      {user && (
        <div>
          <h2>
            Welcome <em>{user.name}</em>
          </h2>

          {games.length > 0 && (
            <div>
              <h3>Games</h3>
              <ul>
                {games.map((game) => (
                  <li key={game.id}>
                    <a href={`/game/${game.id}`}>{game.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <CreateGameForm userId={user?.id} />
        </div>
      )}
    </div>
  );
}

export default App;
