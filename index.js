const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'goodreads.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

// Get Books API
app.get('/books/', async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      book
    ORDER BY
      book_id;`
  const booksArray = await db.all(getBooksQuery)
  response.send(booksArray)
})

//Get Book API
app.get('/books/:bookId/', async (request, response) => {
  const {bookId} = request.params
  const getBooksQuery = `
  SELECT 
  * 
  FROM
  book
  WHERE book_id = ${bookId};`

  const book = await db.get(getBooksQuery)

  response.send(book)
})

//ADD Book API
app.post('/books/', async (request, response) => {
  const bookDetails = request.body
  const {title, authorId, rating, description, pages, price} = bookDetails
  const addBookQuery = `INSERT INTO book (title, author_Id, rating,description,pages,price)
                             VALUES ('${title}',${authorId},${rating},'${description}',${pages},${price});`
  const dbResponse = await db.run(addBookQuery)
  const bookId = dbResponse.lastID
  console.log(bookId)
  response.send({bookId: bookId})
})
