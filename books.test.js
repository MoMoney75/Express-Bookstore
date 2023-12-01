process.env.NODE_ENV = "test";
const request = require("supertest")
const app = require("./app");
const db = require("./db");
const { describe } = require("node:test");
const Book = require("./models/book");

let book_isbn;

beforeEach(async () => {
   let result = await db.query(`
      INSERT INTO
        books (isbn, amazon_url, author, language, pages, publisher, title, year)
        VALUES(
          '12345',
          'https://amazon.com/test_book',
          'test',
          'book',
          234,
          'Not available',
          'testing', 2023)
        RETURNING *`);
    return result.rows;
});


describe("/GET", function(){
  test("get all books", async function(){
      const response = await request(app).get('/books');
      expect(response.statusCode).toEqual(200)
      expect(response.body).toEqual(
        {
          "books":
         [
          {
          "amazon_url": "https://amazon.com/test_book", 
         "author": "test", 
         "isbn": "12345", 
         "language": "book", 
         "pages": 234, 
         "publisher": "Not available", 
         "title": "testing", 
         "year": 2023
        }
      ]
    }
      )
  })

  test("/GET one book", async function(){
    const response = await request(app).get('/books/12345')
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual(
      {
        book: {
          isbn: '12345',
          amazon_url: 'https://amazon.com/test_book',
          author: 'test',
          language: 'book',
          pages: 234,
          publisher: 'Not available',
          title: 'testing',
          year: 2023
        }
      }
  
    )
  })

  test('/GET isbn does not exist', async function(){
    const response = await request(app).get('/books/11111');
    expect(response.statusCode).toEqual(404)
    expect(response.body).toEqual( {
      error: { message: 'There is no book with an isbn of 11111', status: 404 },
      message: 'There is no book with an isbn of 11111'
    }

)
  })
})

describe("/POST", function(){
  test("create a book", async function(){
    const response = await request(app).post('/books').send({
      isbn : "99999",
      amazon_url : 'https://amazon.com/test_book2',
      author : "test_author",
      language : "english", 
      pages : 1000,
      publisher : "test_pub",
      title : "title2",
      year : 2024
  })
  expect(response.statusCode).toEqual(201)
  expect(response.body).toEqual(
    {
      book: {
      isbn: '99999',
      amazon_url: 'https://amazon.com/test_book2',
      author: 'test_author',
      language: 'english',
      pages: 1000,
      publisher: 'test_pub',
      title: 'title2',
      year: 2024
    }
  }
  )
  })

  test("/POST invalid data", async function(){
    const response = await request(app).post('/books').send({
      isbn : "99999",
      amazon_url : 'https://amazon.com/test_book2',
      author : "test_author",
      language : "english", 
      pages : 1000,
      publisher : "test_pub",
      title : "title2",
      year : "2024",
      
  })

expect(response.statusCode).toEqual(400)

  })
})

describe("update an existing book", function(){
  test('/isbn, update year from 2023 to 2029: valid data', async function(){
    await Book.update('12345',
        {
      amazon_url: "https://amazon.com/test_book33", 
       author: "test", 
       language: "book", 
       pages: 234, 
       publisher: "Not available", 
       title: "testing", 
       year: 2029
      })

      const response = await request(app).get('/books/12345')
      console.log(response.body)
      expect(response.statusCode).toEqual(200)
      expect(response.body).toEqual(
        {
          book: {
            isbn: '12345',
            amazon_url: 'https://amazon.com/test_book33',
            author: 'test',
            language: 'book',
            pages: 234,
            publisher: 'Not available',
            title: 'testing',
            year: 2029
          }
        }
    
      )
  })})

describe('/delete', function (){
  test('/delete book', async function (){
    const response = await request(app).delete('/books/12345') ; 
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual({ message: 'Book deleted' })
  })
})

afterEach(async function () {
    await db.query("DELETE FROM BOOKS");
  });
  
  
  afterAll(async function () {
    await db.end()
  });