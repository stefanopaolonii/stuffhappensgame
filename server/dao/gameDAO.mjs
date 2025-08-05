import db from '../db.mjs';

export default function gameDAO() {
  // Add a new game
  this.addGame = (userId, status, startedAt, ownedCards) => {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO games (userId, status, startedAt, ownedCards) VALUES (?, ?, ?, ?)';
      db.run(query, [userId, status, startedAt, ownedCards], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }
  // Get all games for a user
  this.getGamesHistory = (userId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT g.id, g.status, g.startedAt, g.ownedCards,
          c.name, c.imagePath, c.badLuckIndex,
          gc.roundNumber, gc.won
        FROM games g 
        JOIN game_cards gc ON g.id = gc.gameId
        JOIN cards c ON gc.cardId = c.id
        WHERE g.userId = ? 
        ORDER BY g.startedAt DESC, gc.roundNumber
      `;
      db.all(query, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else if (!rows) {
          resolve([]);
        } else {
          const games = mapRowsToGames(rows);
          resolve(games);
        }
      });
    });
  }
}

// Function to map rows to game objects
function mapRowsToGames(rows) {
  const games = [];
  let currentGame = null;

  rows.forEach(row => {
    if (!currentGame || currentGame.id !== row.id) {
      if (currentGame) {
        games.push(currentGame);
      }
      currentGame = {
        id: row.id,
        status: row.status,
        startedAt: row.startedAt,
        ownedCards: row.ownedCards,
        rounds: []
      };
    }
    currentGame.rounds.push({
      name: row.name,
      imagePath: row.imagePath,
      badLuckIndex: row.badLuckIndex,
      roundNumber: row.roundNumber,
      won: row.won
    });
  });
  if (currentGame) {
    games.push(currentGame);
  }
  return games;
}