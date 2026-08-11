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

    values.push(identifier, `%${identifier}%`);

    const query = `UPDATE users SET ${fields.join(', ')} WHERE email = ? OR LOWER(name) LIKE LOWER(?)`;

    db.run(query, values, function (err) {
      if (err) reject(err);
      else resolve({ changes: this.changes });
    });
  });
};

export const deleteUserByEmail = (identifier) => {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM users WHERE email = ? OR LOWER(name) LIKE LOWER(?)`;
    db.run(query, [identifier, `%${identifier}%`], function (err) {
      if (err) reject(err);
      else resolve({ changes: this.changes });
    });
  });
};

export const queryUsersDb = (params) => {
  return new Promise((resolve, reject) => {
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
    if (params.queryText && params.queryText.trim().length > 0) {
      const q = params.queryText.trim();
      const ignoreWords = ['wh', 'what', 'who', 'where', 'how', 'show', 'get', 'tell', 'me', 'the', 'user', 'users', 'is', 'are'];
      if (!ignoreWords.includes(q.toLowerCase())) {
        sql += ` AND (LOWER(name) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?))`;
        values.push(`%${q}%`, `%${q}%`);
      }
    }

    db.all(sql, values, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
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
