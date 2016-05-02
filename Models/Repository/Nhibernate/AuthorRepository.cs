using Microsoft.Extensions.PlatformAbstractions;
using NHibernate;
using NHibernate.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Books.Models.Repository.NHibernate
{
    public class AuthorRepository : IAuthorRepository
    {
        private ISession session;

        public AuthorRepository(ISession _session)
        {
            session = _session;
        }

        public void Create(Author author)
        {
            session.Save(author);
        }

        public void Delete(int id)
        {
            Author author = session.Get<Author>(id);
            session.Delete(author);
        }

        public void Dispose()
        {
            session.Dispose();
        }

        public Author GetAuthor(int id)
        {
            return session.Get<Author>(id);
        }

        public IEnumerable<Author> GetAuthors(Book book=null)
        {

            if (book != null)
                return book.Authors.ToList();
            else
                return session.Query<Author>().ToList();

        }

        public void Update(Author author)
        {
           session.Update(author);
        }

        public IEnumerable<AutocompleteItem> GetAutocompleteList(string term)
        {
            return session.Query<Author>().Where(x => x.Name.ToLower().Contains(term.ToLower()))
                        .OrderBy(x => x.Name)
                        .Select(x => new AutocompleteItem { label = x.Name, value = x.Name, Id = x.Id }).ToList();
        }
    }
}
