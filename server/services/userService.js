import db from '../config/db.js';

export const getAllUsers = () => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM users ORDER BY id DESC`, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const addUser = (userData) => {
  return new Promise((resolve, reject) => {
    const { name, email, phone, city, status = 'Active' } = userData;
    const created = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
    const query = `INSERT INTO users (name, email, phone, city, status, created) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(query, [name || email.split('@')[0], email, phone || '012-000-0000', city || 'Unknown', status, created], function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, name, email, phone, city, status, created });
    });
  });
};

export const updateUserByEmail = (identifier, updateFields) => {
  return new Promise((resolve, reject) => {
    const fields = [];
    const values = [];
    const allowedKeys = ['name', 'phone', 'city', 'status', 'email'];

    Object.keys(updateFields).forEach((key) => {
      if (allowedKeys.includes(key) && key !== 'emailOrName' && updateFields[key] !== undefined && updateFields[key] !== null) {
        fields.push(`${key} = ?`);
        values.push(updateFields[key]);
      }
    });

    if (fields.length === 0) return resolve({ changes: 0 });

    const sqlValues = [...values, identifier, `%${identifier}%`];
    const query = `UPDATE users SET ${fields.join(', ')} WHERE email = ? OR LOWER(name) LIKE LOWER(?)`;

    db.run(query, sqlValues, function (err) {
      if (err) return reject(err);
      if (this.changes > 0) return resolve({ changes: this.changes });

      // Fuzzy match fallback for update
      db.all(`SELECT * FROM users`, [], (errAll, allUsers) => {
        if (errAll || !allUsers || allUsers.length === 0) return resolve({ changes: 0 });
        const target = identifier.toLowerCase();
        const levDist = (a, b) => {
          const m = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
          for (let i = 0; i <= a.length; i++) m[i][0] = i;
          for (let j = 0; j <= b.length; j++) m[0][j] = j;
          for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
              const cost = a[i - 1] === b[j - 1] ? 0 : 1;
              m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + cost);
            }
          }
          return m[a.length][b.length];
        };

        const matchedUser = allUsers.find(u => {
          const n = (u.name || '').toLowerCase();
          const e = (u.email || '').toLowerCase().split('@')[0];
          return levDist(target, n) <= 2 || levDist(target, e) <= 2;
        });

        if (matchedUser) {
          const fValues = [...values, matchedUser.id];
          const fQuery = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
          db.run(fQuery, fValues, function (fErr) {
            if (fErr) reject(fErr);
            else resolve({ changes: this.changes, matchedName: matchedUser.name });
          });
        } else {
          resolve({ changes: 0 });
        }
      });
    });
  });
};

export const deleteUserByEmail = (identifier) => {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM users WHERE email = ? OR LOWER(name) LIKE LOWER(?)`;
    db.run(query, [identifier, `%${identifier}%`], function (err) {
      if (err) return reject(err);
      if (this.changes > 0) return resolve({ changes: this.changes });

      // Fuzzy match fallback for delete
      db.all(`SELECT * FROM users`, [], (errAll, allUsers) => {
        if (errAll || !allUsers || allUsers.length === 0) return resolve({ changes: 0 });
        const target = identifier.toLowerCase();
        const levDist = (a, b) => {
          const m = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
          for (let i = 0; i <= a.length; i++) m[i][0] = i;
          for (let j = 0; j <= b.length; j++) m[0][j] = j;
          for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
              const cost = a[i - 1] === b[j - 1] ? 0 : 1;
              m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + cost);
            }
          }
          return m[a.length][b.length];
        };

        const matchedUser = allUsers.find(u => {
          const n = (u.name || '').toLowerCase();
          const e = (u.email || '').toLowerCase().split('@')[0];
          return levDist(target, n) <= 2 || levDist(target, e) <= 2;
        });

        if (matchedUser) {
          db.run(`DELETE FROM users WHERE id = ?`, [matchedUser.id], function (fErr) {
            if (fErr) reject(fErr);
            else resolve({ changes: this.changes, matchedName: matchedUser.name });
          });
        } else {
          resolve({ changes: 0 });
        }
      });
    });
  });
};

export const queryUsersDb = (params) => {
  return new Promise((resolve, reject) => {
    const rawQuery = params.queryText ? params.queryText.trim() : '';
    const ignoreWords = ['wh', 'what', 'who', 'where', 'how', 'show', 'get', 'tell', 'me', 'the', 'user', 'users', 'is', 'are', 'look', 'for', 'find', 'search'];
    
    let sql = `SELECT * FROM users WHERE 1=1`;
    const values = [];

    if (params.initial && params.initial.trim().length > 0) {
      sql += ` AND (LOWER(name) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?))`;
      values.push(`${params.initial.trim()}%`, `${params.initial.trim()}%`);
    }
    if (params.status && params.status.trim().length > 0) {
      sql += ` AND LOWER(status) = LOWER(?)`;
      values.push(params.status.trim());
    }
    if (params.city && params.city.trim().length > 0) {
      sql += ` AND LOWER(city) LIKE LOWER(?)`;
      values.push(`%${params.city.trim()}%`);
    }

    if (rawQuery.length > 0 && !ignoreWords.includes(rawQuery.toLowerCase())) {
      sql += ` AND (LOWER(name) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?) OR LOWER(city) LIKE LOWER(?))`;
      values.push(`%${rawQuery}%`, `%${rawQuery}%`, `%${rawQuery}%`);
    }

    db.all(sql, values, (err, rows) => {
      if (err) return reject(err);
      if (rows.length > 0 || !rawQuery || ignoreWords.includes(rawQuery.toLowerCase())) {
        return resolve(rows);
      }

      // Fuzzy / Soundalike Fallback if exact SQL LIKE returns zero rows
      db.all(`SELECT * FROM users`, [], (errAll, allUsers) => {
        if (errAll || !allUsers) return resolve([]);
        const target = rawQuery.toLowerCase();
        
        const levDistance = (a, b) => {
          const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
          for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
          for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
          for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
              const cost = a[i - 1] === b[j - 1] ? 0 : 1;
              matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
              );
            }
          }
          return matrix[a.length][b.length];
        };

        const fuzzyMatches = allUsers.filter(u => {
          const namePart = (u.name || '').toLowerCase();
          const emailPart = (u.email || '').toLowerCase().split('@')[0];
          const distName = levDistance(target, namePart);
          const distEmail = levDistance(target, emailPart);
          return distName <= 2 || distEmail <= 2;
        });

        resolve(fuzzyMatches);
      });
    });
  });
};

export const saveChatMessage = (sender, text) => {
  return new Promise((resolve, reject) => {
    db.run(`INSERT INTO chat_history (sender, text) VALUES (?, ?)`, [sender, text], function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, sender, text });
    });
  });
};

export const getChatHistory = () => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM chat_history ORDER BY id ASC`, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};
