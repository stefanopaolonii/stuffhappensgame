import db from '../db.mjs';
import crypto from 'crypto';

export default function userDAO() {
  // get a user by its credentials
  this.getUserByCredentials = (email, password) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE email = ?';
      db.get(query, [email], (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(false);
        } else {
          const user = {
            id: row.id,
            name: row.name,
            email: row.email
          };
          // Check the hash with async function
          crypto.scrypt(password, Buffer.from(row.salt, 'hex'), 64, (err, hashedPassword) => {
            if (err) {
              reject(err);
            }
            if (!crypto.timingSafeEqual(Buffer.from(row.hash, 'hex'), hashedPassword)) {
              resolve(false);
            } else {
              resolve(user);
            }
          });
        }
      });
    });
  }
}