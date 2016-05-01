using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Books.Models.Repository
{
    interface IBooksToAuthorsRepository : IDisposable
    {
        IEnumerable<Author> GetAuthors(int bookId);
        void Create(BooksToAuthors booksToAuthors);
        void Update(BooksToAuthors booksToAuthors);
        void Delete(int bookId, int AuthorId);
    }
}
