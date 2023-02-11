const { Server } = require("socket.io");
const { setupDB } = require("./db");

const clientUrl = process.env.CLIENT_URL || "http://localhost:3200";
let db, io, socket;

exports.setupIO = function (server) {
  console.log("CLIENT_URL", clientUrl);

  io = new Server(server, {
    cors: {
      origin: clientUrl
    }
  });

  io.on("connection", (_socket) => {
    _db = setupDB();

    socket = _socket;
    db = _db;

    setupComms();

    _socket.emit("connected");

    console.log(`${io.engine.clientsCount} client(s) connected - ${socket.id}`);
  });
};

function setupComms() {
  socket.on("create user", ({ id, name }) => {
    console.log("create user");
    const existingUser = db.data.users.find((user) => user.name === name);
    if (existingUser) {
      socket.emit("user exists", existingUser);
    } else {
      db.data.users.push({ id, name });
      db.write();
      socket.emit("user created", { id, name });
    }
  });

  socket.on("get user", ({ id }) => {
    console.log("get user");

    const user = db.data.users.find((user) => user.id === id);

    if (!user) {
      socket.emit("user not found");
    } else {
      socket.emit("user found", user);
    }
  });

  socket.on("create game", ({ id, name = "", admin }) => {
    console.log("create game");
    db.data.games.push({ name, id, admin, users: [admin] });
    db.write();
    socket.emit("game created", {
      name,
      id,
      admin,
      users: [admin],
      rounds: [],
      status: "open"
    });
  });

  socket.on("join game", ({ gameId, userId }) => {
    console.log("join game");

    const game = db.data.games.find((game) => game.id === gameId);

    if (!game) {
      socket.emit("game not found");
    } else {
      socket.join("game-" + gameId);
      game.users.push(userId);
      db.write();
      io.in("game-" + gameId).emit("user joined", { userId, gameId });
      socket.emit("joined game", { gameId, userId });
    }
  });

  socket.on("create round", ({ gameId, roundId }) => {
    console.log("create round");

    const game = db.data.games.find((game) => game.id === gameId);

    if (!game) {
      socket.emit("game not found");
    } else {
      if (game.status !== "open") {
        socket.emit("game closed");
        return;
      }

      if (game.rounds.find((round) => round.id === roundId)) {
        socket.emit("round exists");
        return;
      }

      const round = {
        id: roundId,
        gameId,
        status: "open",
        estimates: [],
        finalEstimate: null
      };

      db.data.rounds.push(round);
      game.rounds.push(round);
      db.write();

      io.in("game-" + gameId).emit("round created", round);
    }
  });

  socket.on(
    "create estimate",
    ({ gameId, roundId, estimateId, value, userId }) => {
      console.log("create estimate");

      const game = db.data.games.find((game) => game.id === gameId);
      if (!game) {
        socket.emit("game not found");
        return;
      }

      const round = db.data.rounds.find((round) => round.id === roundId);
      if (!round) {
        socket.emit("round not found");
        return;
      }

      if (round.status !== "open") {
        socket.emit("round closed");
        return;
      }

      if (!game.users.find((_userId) => _userId === userId)) {
        socket.emit("user not in game");
        return;
      }

      const existingEstimate = db.data.estimates.find(
        (estimate) => estimate.userId === userId && estimate.roundId === roundId
      );

      if (existingEstimate) {
        existingEstimate.estimate = estimate;
        db.write();
        io.in("game-" + gameId).emit("estimate updated", existingEstimate);
        return;
      }

      const _estimate = {
        id: estimateId,
        estimate: value,
        roundId,
        userId
      };

      db.data.estimates.push(_estimate);
      round.estimates.push(estimateId);
      db.write();

      io.in("game-" + gameId).emit("estimate created", _estimate);
    }
  );

  socket.on("complete round", ({ roundId, gameId, finalEstimate }) => {
    console.log("complete round");

    const game = db.data.games.find((game) => game.id === gameId);

    if (!game) {
      socket.emit("game not found");
      return;
    }

    const round = db.data.rounds.find((round) => round.id === roundId);

    if (!round) {
      socket.emit("round not found");
      return;
    }

    round.status = "closed";
    round.finalEstimate = finalEstimate;
    db.write();

    io.in("game-" + gameId).emit("round completed", round);
  });

  socket.on("complete game", ({ gameId, userId }) => {
    console.log("complete game");

    const game = db.data.games.find((game) => game.id === gameId);

    if (!game) {
      socket.emit("game not found");
      return;
    }

    if (game.admin !== userId) {
      socket.emit("not admin");
      return;
    }

    game.status = "closed";

    db.write();

    io.in("game-" + gameId).emit("game completed", game);
  });
}
