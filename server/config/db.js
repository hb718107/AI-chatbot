import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../database.sqlite');

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      city TEXT,
      status TEXT DEFAULT 'Active',
      created TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender TEXT NOT NULL,
      text TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.get(`SELECT COUNT(*) as count FROM admins`, (err, row) => {
    if (row && row.count === 0) {
      db.run(`INSERT INTO admins (username, password) VALUES (?, ?)`, ['admin', 'password']);
    }
  });

  db.get(`SELECT COUNT(*) as count FROM users`, (err, row) => {
    if (row && row.count === 0) {
      const stmt = db.prepare(`INSERT INTO users (name, email, phone, city, status, created) VALUES (?, ?, ?, ?, ?, ?)`);
      stmt.run('Alex Chen', 'alex.chen@mail.co', '012-205-6639', 'New York', 'Active', '12/23/24');
      stmt.run('Sarsh Kim', 'sarsh.kim@mail.co', '012-295-8839', 'Los Angeles', 'Offline', '12/23/24');
      stmt.run('Jora Kim', 'jora.kim@mail.co', '012-297-8839', 'Chicago', 'Active', '12/24/24');
      stmt.run('Monic Inan', 'monic.inan@mail.co', '012-203-6838', 'Houston', 'Active', '12/24/24');
      stmt.run('Jenat Kiow', 'jenat.kiow@mail.co', '012-205-6639', 'Phoenix', 'Suspended', '12/23/24');
      stmt.run('Sarah Kim', 'sarah.kim@mail.co', '012-291-6639', 'Philadelphia', 'Suspended', '12/24/24');
      stmt.run('Maxin Holans', 'maxin.holans@mail.co', '012-291-8639', 'San Antonio', 'Active', '12/24/24');
      stmt.finalize();
    }
  });
});

export default db;
