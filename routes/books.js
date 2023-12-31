const express = require("express");
const Book = require("../models/book");
const jsonSchema = require("jsonschema");
const bookSchema = require("../bookSchema.json");
const updateBookSchema = require('../UpdateBookSchema')
const ExpressError = require("../expressError");
const router = new express.Router();


/** GET / => {books: [book, ...]}  */

router.get("/", async function (req, res, next) {
  try {
    const books = await Book.findAll(req.query);
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  => {book: book} */

router.get("/:isbn", async function (req, res, next) {
  const isbn = req.params.isbn
  try {
    const book = await Book.findOne(isbn);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** POST /   bookData => {book: newBook}  */

router.post("/", async function (req, res, next) {
  let user_input = req.body
  try {
    let result = jsonSchema.validate(user_input,bookSchema)
    if(!result.valid){
     return next({
      status: 400,
      error: result.errors.map(e => e.stack)
     })
      }
    
    const book = await Book.create(req.body);
    return res.status(201).json({ book });
  } catch (err) {
    return next(err);
  }
});

/** PUT /[isbn]   bookData => {book: updatedBook}  */

router.put("/:isbn", async function (req, res, next) {
  let {isbn} = req.params;
  let data = req.body
  try {
    let result = jsonSchema.validate(data,updateBookSchema)
    if(!result.valid){
     return next({
      status: 400,
      error: result.errors.map(e => e.stack)
     })
      }
    
    const book = await Book.update(isbn,data);
    return res.status(201).json({ book });
  } catch (err) {
    return next(err);
  }
});


/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete("/:isbn", async function (req, res, next) {
  try {
    await Book.remove(req.params.isbn);
    return res.json({ message: "Book deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
