using Microsoft.Extensions.PlatformAbstractions;
using NHibernate;
using NHibernate.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Books.Models.Repository.NHibernate
{
    public class BooksToAuthorsRepository : IBooksToAuthorsRepository
    {
        private ISession session;

        public BooksToAuthorsRepository(ISession _session)
        {
            session = _session;
        }

        public void Create(BooksToAuthors booksToAuthors)
        {
            session.Save(booksToAuthors);
        }

        public void Delete(int bookId, int AuthorId)
        {
            Book book = session.Get<Book>(bookId);
            Author author = session.Get<Author>(AuthorId);
            book.Authors.RemoveAt(book.Authors.IndexOf(author));
        }

        public void Dispose()
        {
            session.Dispose();
        }

        public IEnumerable<Author> GetAuthors(int bookId)
        {
            return (from row in session.Query<BooksToAuthors>()
                           where (row.IdBook == bookId)
                           join author in session.Query<Author>() on row.IdAuthor equals author.Id
                           select new Author
                           {
                               Id = row.IdAuthor,
                               Name = author.Name,
                           }).ToList();
        }


        public void Update(BooksToAuthors booksToAuthors)
        {
           session.Update(booksToAuthors);
        }
    }
}
