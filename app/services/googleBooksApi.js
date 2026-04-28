const axios = require('axios');

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';
const OPEN_LIBRARY_COVERS_URL = 'https://covers.openlibrary.org/b/isbn';

async function getGoogleBooksThumbnail(cleanIsbn) {
  const response = await axios.get(GOOGLE_BOOKS_API_URL, {
    params: { q: `isbn:${cleanIsbn}` },
    timeout: 5000,
  });

  if (
    response.data.totalItems > 0 &&
    response.data.items &&
    response.data.items[0].volumeInfo &&
    response.data.items[0].volumeInfo.imageLinks
  ) {
    const imageLinks = response.data.items[0].volumeInfo.imageLinks;
    return imageLinks.thumbnail || imageLinks.smallThumbnail || null;
  }

  return null;
}

async function getThumbnailByIsbn(isbn) {
  if (!isbn) {
    return null;
  }

  const cleanIsbn = isbn.replace(/-/g, '');

  try {
    const thumbnail = await getGoogleBooksThumbnail(cleanIsbn);
    if (thumbnail) {
      return thumbnail;
    }
  } catch (error) {
    console.error(`Google Books API error for ISBN ${isbn}:`, error.message);
  }

  return `${OPEN_LIBRARY_COVERS_URL}/${cleanIsbn}-L.jpg?default=false`;
}

module.exports = { getThumbnailByIsbn };
