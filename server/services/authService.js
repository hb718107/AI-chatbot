import db from '../config/db.js';

export const registerAdmin = (username, password) => {
  return new Promise((resolve, reject) => {
    db.run(`INSERT INTO admins (username, password) VALUES (?, ?)`, [username, password], function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, username });
    });
  });
};

export const verifyAdmin = (username, password) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM admins WHERE username = ? AND password = ?`, [username, password], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};
