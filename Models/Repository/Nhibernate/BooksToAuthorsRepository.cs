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

        public BooksToAuthorsRepository(IApplicationEnvironment appEnvironment)
        {
            session = OpenNHibSession.OpenSession(appEnvironment).nHibernateSession;
        }

        public void Create(BooksToAuthors booksToAuthors)
        {
             session.Save(booksToAuthors);             
        }

        public void Delete(int bookId)
        {
            var booksToAuthors = session.Query<BooksToAuthors>().Where(x => x.IdBook == bookId).ToList();
            foreach(var e in booksToAuthors)
            {
                session.Delete(e);
            }
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
