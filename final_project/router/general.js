const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Helper function to simulate async operation
const asyncGetBooks = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(books);
        }, 100);
    });
};

// Helper function to simulate async book search by ISBN
const asyncGetBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const book = books[isbn];
            if (book) {
                resolve(book);
            } else {
                reject(new Error("Book not found"));
            }
        }, 100);
    });
};

// Helper function to simulate async book search by author
const asyncGetBooksByAuthor = (author) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const booksByAuthor = [];
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
                resolve(booksByAuthor);
            } else {
                reject(new Error("No books found by this author"));
            }
        }, 100);
    });
};

// Helper function to simulate async book search by title
const asyncGetBooksByTitle = (title) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const booksByTitle = [];
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
                resolve(booksByTitle);
            } else {
                reject(new Error("No books found with this title"));
            }
        }, 100);
    });
};

// TASK 10: Get the book list using async/await
public_users.get('/', async function (req, res) {
    try {
        const booksData = await asyncGetBooks();
        return res.status(200).json({
            message: "List of all books available in the shop",
            books: booksData
        });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books" });
    }
});

// TASK 11: Get book details based on ISBN using async/await
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    
    try {
        const book = await asyncGetBookByISBN(isbn);
        return res.status(200).json(book);
    } catch (error) {
        return res.status(404).json({ message: "Book not found" });
    }
});

// TASK 12: Get book details based on author using async/await
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    
    try {
        const booksByAuthor = await asyncGetBooksByAuthor(author);
        return res.status(200).json({ books: booksByAuthor });
    } catch (error) {
        return res.status(404).json({ message: "No books found by this author" });
    }
});

// TASK 13: Get all books based on title using async/await
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    
    try {
        const booksByTitle = await asyncGetBooksByTitle(title);
        return res.status(200).json({ books: booksByTitle });
    } catch (error) {
        return res.status(404).json({ message: "No books found with this title" });
    }
});

// Original synchronous implementations (keep these for reference)
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Both username and password are required" });
    }

    if (users.find(user => user.username === username)) {
        return res.status(409).json({ message: "Username already exists" });
    }

    users.push({ username, password });
    return res.status(201).json({ message: "User successfully registered" });
});

// Get book review (synchronous)
public_users.get('/review/:isbn', function (req, res) {
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