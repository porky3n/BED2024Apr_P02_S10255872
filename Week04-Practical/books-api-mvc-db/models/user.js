const sql = require("mssql");
const dbConfig = require("../dbConfig");

class User {
  constructor(id, username, email) {
    this.id = id;
    this.username = username;
    this.email = email;
  }

  static async getAllUsers() {
    let connection;
    try {
      connection = await sql.connect(dbConfig);
      const sqlQuery = `SELECT * FROM Users`; // Replace with your actual table name
      const result = await connection.request().query(sqlQuery);
      return result.recordset.map(
        (row) => new User(row.id, row.username, row.email)
      );
    } finally {
      connection && connection.close();
    }
  }

  static async getUserById(id) {
    let connection;
    try {
      connection = await sql.connect(dbConfig);
      const sqlQuery = `SELECT * FROM Users WHERE id = @id`; // Parameterized query
      const request = connection.request();
      request.input("id", sql.Int, id);
      const result = await request.query(sqlQuery);
      return result.recordset[0]
        ? new User(result.recordset[0].id, result.recordset[0].username, result.recordset[0].email)
        : null;
    } finally {
      connection && connection.close();
    }
  }

  static async createUser(newUserData) {
    let connection;
    try {
      connection = await sql.connect(dbConfig);
      const sqlQuery = `INSERT INTO Users (username, email) VALUES (@username, @email); SELECT SCOPE_IDENTITY() AS id;`; // Retrieve ID of inserted record
      const request = connection.request();
      request.input("username", sql.NVarChar, newUserData.username);
      request.input("email", sql.NVarChar, newUserData.email);
      const result = await request.query(sqlQuery);
      return this.getUserById(result.recordset[0].id);
    } finally {
      connection && connection.close();
    }
  }

  static async updateUser(id, newUserData) {
    let connection;
    try {
      connection = await sql.connect(dbConfig);
      const sqlQuery = `UPDATE Users SET username = @username, email = @email WHERE id = @id`; // Parameterized query
      const request = connection.request();
      request.input("id", sql.Int, id);
      request.input("username", sql.NVarChar, newUserData.username || null); // Handle optional fields
      request.input("email", sql.NVarChar, newUserData.email || null);
      await request.query(sqlQuery);
      return this.getUserById(id); // Returning the updated user data
    } finally {
      connection && connection.close();
    }
  }

  static async deleteUser(id) {
    let connection;
    try {
      connection = await sql.connect(dbConfig);
      const sqlQuery = `DELETE FROM Users WHERE id = @id`; // Parameterized query
      const request = connection.request();
      request.input("id", sql.Int, id);
      const result = await request.query(sqlQuery);
      return result.rowsAffected > 0; // Indicate success based on affected rows
    } finally {
      connection && connection.close();
    }
  }

  static async searchUsers(searchTerm) {
    let connection;
    try {
      connection = await sql.connect(dbConfig);
      const query = `
        SELECT *
        FROM Users
        WHERE username LIKE @searchTerm
          OR email LIKE @searchTerm
      `;
      const request = connection.request();
      request.input("searchTerm", sql.NVarChar, `%${searchTerm}%`);
      const result = await request.query(query);
      return result.recordset.map(
        (row) => new User(row.id, row.username, row.email)
      );
    } catch (error) {
      throw new Error("Error searching users");
    } finally {
      connection && connection.close();
    }
  }

  static async getUsersWithBooks() {
    const connection = await sql.connect(dbConfig);

    try {
      const query = `
        SELECT u.id AS user_id, u.username, u.email, b.id AS book_id, b.title, b.author
        FROM Users u
        LEFT JOIN UserBooks ub ON ub.user_id = u.id
        LEFT JOIN Books b ON ub.book_id = b.id
        ORDER BY u.username;
      `;

      const result = await connection.request().query(query);

      // Group users and their books
      const usersWithBooks = {};
      for (const row of result.recordset) {
        const userId = row.user_id;
        if (!usersWithBooks[userId]) {
          usersWithBooks[userId] = {
            id: userId,
            username: row.username,
            email: row.email,
            books: [],
          };
        }
        usersWithBooks[userId].books.push({
          id: row.book_id,
          title: row.title,
          author: row.author,
        });
      }

      return Object.values(usersWithBooks);
    } catch (error) {
      throw new Error("Error fetching users with books");
    } finally {
      await connection.close();
    }
  }
}

module.exports = User;
