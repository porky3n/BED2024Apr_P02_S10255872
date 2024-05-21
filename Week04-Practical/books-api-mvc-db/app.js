const express = require("express");
const validateBook = require("./middlewares/validateBook");
const booksController = require("./controllers/booksController");
const usersController = require("./controllers/usersController");
const sql = require("mssql");
const dbConfig = require("./dbConfig");
const bodyParser = require("body-parser"); // Path to the public folder

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For form data handling

app.use(express.static("public"));

const router=express.Router();
app.use("/users",router);

app.get("/books", booksController.getAllBooks);
app.get("/books/:id", booksController.getBookById);
app.post("/books", validateBook, booksController.createBook); // POST for creating books (can handle JSON data)
app.put("/books/:id", validateBook, booksController.updateBook);
app.delete("/books/:id", booksController.deleteBook); // DELETE for deleting books

router.get("/with-books", usersController.getUsersWithBooks);
router.get("/search", usersController.searchUsers);
router.post("/", usersController.createUser); // Create user
router.get("/", usersController.getAllUsers); // Get all users
router.get("/:id", usersController.getUserById); // Get user by ID
router.put("/:id", usersController.updateUser); // Update user
router.delete("/:id", usersController.deleteUser); // Delete user



app.listen(port, async () => {
  try {
    // Connect to the database
    await sql.connect(dbConfig);
    console.log("Database connection established successfully");
  } catch (err) {
    console.error("Database connection error:", err);
    // Terminate the application with an error code (optional)
    process.exit(1); // Exit with code 1 indicating an error
  }

  console.log(`Server listening on port ${port}`);
});

// Close the connection pool on SIGINT signal
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  // Perform cleanup tasks (e.g., close database connections)
  await sql.close();
  console.log("Database connection closed");
  process.exit(0); // Exit with code 0 indicating successful shutdown
});


module.exports = router;