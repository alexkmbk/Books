using Microsoft.Extensions.PlatformAbstractions;
using NHibernate;
using NHibernate.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Books.Models.Repository.NHibernate
{
    public class BookRepository : IBookRepository
    {
        private ISession session;

        public BookRepository(IApplicationEnvironment appEnvironment)
        {
            session = OpenNHibSession.OpenSession(appEnvironment).nHibernateSession;
        }

        public void Create(Book book)
        {
            var transaction = session.BeginTransaction();
            session.Save(book);
            transaction.Commit();
        }

        public void Delete(int id)
        {
            var transaction = session.BeginTransaction();
            Book book = new Book();
            book.Id = id;
            session.Delete(book);
            transaction.Commit();
        }

        public void Dispose()
        {
            session.Dispose();
        }

        public IEnumerable<AutocompleteItem> GetAutocompleteList(string term)
        {
            return session.Query<Book>().Where(x => x.Name.ToLower().Contains(term.ToLower()))
                        .OrderBy(x => x.Name)
                        .Select(x => new AutocompleteItem { label = x.Name, value = x.Name, Id = x.Id }).ToList();
        }

        public Book GetBook(int id)
        {
            return session.Get<Book>(id);
        }

        public IEnumerable<Book> GetBooks(int AuthorId = 0, int PublisherId = 0)
        {
 
            if (AuthorId != 0 && PublisherId != 0)
            {
                return session.Query<Book>().Where(x => x.Authors.Contains(session.Get<Author>(AuthorId)) && x.publisher.Id == PublisherId);
            }
            else if (AuthorId != 0)
            {
                return session.Query<Book>().Where(x => x.Authors.Contains(session.Get<Author>(AuthorId)));
            }
            else if (PublisherId != 0)
            {
                return session.Query<Book>().Where(x => x.publisher.Id == PublisherId);
            }
            else
                return session.Query<Book>();

        }

        public void Update(Book book)
        {
           session.Update(book);
        }


    }
}
