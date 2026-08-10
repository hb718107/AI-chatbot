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

export const updateUserByEmail = (email, updateFields) => {
  return new Promise((resolve, reject) => {
    const fields = [];
    const values = [];
    Object.keys(updateFields).forEach((key) => {
      if (updateFields[key] !== undefined && key !== 'email') {
        fields.push(`${key} = ?`);
        values.push(updateFields[key]);
      }
    });

    if (fields.length === 0) return resolve(null);
    values.push(email);

    const query = `UPDATE users SET ${fields.join(', ')} WHERE email = ? OR LOWER(name) LIKE LOWER(?)`;
    values.push(`%${email}%`);

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

    if (params.initial) {
      sql += ` AND (LOWER(name) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?))`;
      values.push(`${params.initial}%`, `${params.initial}%`);
    }
    if (params.status) {
      sql += ` AND LOWER(status) = LOWER(?)`;
      values.push(params.status);
    }
    if (params.city) {
      sql += ` AND LOWER(city) LIKE LOWER(?)`;
      values.push(`%${params.city}%`);
    }
    if (params.queryText) {
      sql += ` AND (LOWER(name) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?))`;
      values.push(`%${params.queryText}%`, `%${params.queryText}%`);
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
