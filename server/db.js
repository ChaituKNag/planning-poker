const { MemorySync, LowSync } = require('lowdb-node');

let db;

exports.setupDB = function() {
    db = new LowSync(new MemorySync());

    db.read();
    
    db.data = {
      users: [],
      games: [],
      rounds: [],
      estimates: []
    }

    return db;
}

exports.getDB = function() {
    if(!db) throw Error('DB not initialized. Call setupDB first.')
    return db;
}