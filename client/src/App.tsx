import { useLayoutEffect, useRef, useState } from "react";
import { getIo } from "./api";
import { v4 as uuid } from "uuid";

interface User {
  id: string;
  name: string;
}

function App() {
  const [user, setUser] = useState<{ id: string; name: string } | null>(() => {
    const user = localStorage.getItem("user");
    if (user) {
      return JSON.parse(user);
    }
    return null;
  });
  const userNameRef = useRef<HTMLInputElement>(null);

  const handleFetchUser = (u: User) => {
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
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

    io.emit("create user", { name: userNameRef.current?.value, id: uuid() });

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

      {user && <div>{user.name}</div>}
    </div>
  );
}

export default App;
