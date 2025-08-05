import db from '../db.mjs';


export default function gameCardDAO() {
  // Add a new round
  this.addRound = (gameId, cardId, round, won) => {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO game_cards (gameId, cardId, roundNumber, won) VALUES (?, ?, ?, ?)';
      db.run(query, [gameId, cardId, round, won], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }
}
