const { LowSync, JSONFileSync } = require("lowdb-node");

let db;

exports.setupDB = function () {
  db = new LowSync(new JSONFileSync("./db.json"));

  db.read();

  return db;
};

exports.getDB = function () {
  if (!db) throw Error("DB not initialized. Call setupDB first.");
  return db;
};
