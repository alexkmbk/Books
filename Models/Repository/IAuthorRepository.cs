using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Books.Models.Repository
{
    public interface IAuthorRepository : IDisposable
    {
        IEnumerable<Author> GetAuthors(Book book=null);
        Author GetAuthor(int id);
        void Create(Author author);
        void Update(Author author);
        void Delete(int id);
        IEnumerable<AutocompleteItem> GetAutocompleteList(string term);
    }
}
