const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username and password are provided
  if (!username && !password) {
    return res.status(400).json({ 
      message: "Both username and password are required" 
    });
  }

  if (!username) {
    return res.status(400).json({ 
      message: "Username is required" 
    });
  }

  if (!password) {
    return res.status(400).json({ 
      message: "Password is required" 
    });
  }

  // Check if username already exists
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(409).json({ 
      message: "Username already exists. Please choose a different username." 
    });
  }

  // Validate username format (optional but recommended)
  if (username.length < 3) {
    return res.status(400).json({ 
      message: "Username must be at least 3 characters long" 
    });
  }

  if (username.length > 20) {
    return res.status(400).json({ 
      message: "Username must be less than 20 characters" 
    });
  }

  // Validate password strength (optional but recommended)
  if (password.length < 6) {
    return res.status(400).json({ 
      message: "Password must be at least 6 characters long" 
    });
  }

  // Register new user
  users.push({ 
    username: username, 
    password: password 
  });
  
  return res.status(201).json({ 
    message: "User successfully registered. You can now login." 
  });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {

 return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
   const author = req.params.author;
  const booksByAuthor = [];

  // Get all ISBN keys and iterate through books
  const isbns = Object.keys(books);
  for (let isbn of isbns) {
    if (books[isbn].author.toLowerCase().includes(author.toLowerCase())) {
      booksByAuthor.push({
        isbn: isbn,
        ...books[isbn]
      });
    }
  }

  if (booksByAuthor.length > 0) {
    return res.status(200).json({ books: booksByAuthor });
  } else {
    return res.status(404).json({ message: "No books found by this author" });
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const booksByTitle = [];

  // Get all ISBN keys and iterate through books
  const isbns = Object.keys(books);
  for (let isbn of isbns) {
    if (books[isbn].title.toLowerCase().includes(title.toLowerCase())) {
      booksByTitle.push({
        isbn: isbn,
        ...books[isbn]
      });
    }
  }
  if (booksByTitle.length > 0) {
    return res.status(200).json({ books: booksByTitle });
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book && book.reviews) {
    return res.status(200).json({ reviews: book.reviews });
  } else if (book && !book.reviews) {
    return res.status(200).json({ reviews: {}, message: "No reviews available for this book" });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
