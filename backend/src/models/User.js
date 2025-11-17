import { getConnection } from '../config/database.js';
import bcrypt from 'bcryptjs';

export class User {
  static async findByUsername(username) {
    const db = getConnection();
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    return user || null;
  }

  static async findById(id) {
    const db = getConnection();
    const user = db.prepare('SELECT id, username, created_at FROM users WHERE id = ?').get(id);
    return user || null;
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async create(username, password) {
    const db = getConnection();
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(
      username,
      hashedPassword
    );
    return result.lastInsertRowid;
  }
}



