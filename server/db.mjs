import sqlite3 from 'sqlite3';

const databasePath = './';

const db = new sqlite3.Database(databasePath +`stuffhappens.db`, (err) => {
  if (err) {
    throw err;
  }
});

export default db;