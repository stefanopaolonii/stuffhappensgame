import db from '../db.mjs';

export default function cardDAO() {

  // Get a card by its ID
  this.getCardById = (id) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM cards WHERE id = ?';
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: row.id,
            name: row.name,
            imagePath: row.imagePath,
            badLuckIndex: row.badLuckIndex
          });
        }
      });
    });
  }

  // Get the three initial cards for the game
  this.getInitialCards = () => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM cards ORDER BY RANDOM() LIMIT 3';
      db.all(query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const cards = rows.map(row => ({
            id: row.id,
            name: row.name,
            imagePath: row.imagePath,
            badLuckIndex: row.badLuckIndex
          }));
          resolve(cards);
        }
      });
    });
  }

  // Get a new card for the round, different from the previeous ones
  this.getNextRoundCard = (excludedIds =[]) => {
    return new Promise((resolve, reject) => {
      let query ;
      let params ;
      if (excludedIds.length === 0) {
        query = 'SELECT * FROM cards ORDER BY RANDOM() LIMIT 1';
        params = [];
      }else {
        const placeholders = excludedIds.map(() => '?').join(',');
        query = `SELECT * FROM cards WHERE id NOT IN (${placeholders}) ORDER BY RANDOM() LIMIT 1`;
        params = excludedIds;
      }
      db.get(query, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: row.id,
            name: row.name,
            imagePath: row.imagePath,
          });
        }
      });
    });
  }
}
