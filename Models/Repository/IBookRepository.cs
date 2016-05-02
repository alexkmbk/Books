using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Books.Models.Repository
{
    interface IBookRepository : IDisposable
    {
        IEnumerable<Book> GetBooks(int AuthorId, int PublisherId);
        Book GetBook(int? id);
        void Create(Book item);
        void Update(Book item);
        void Delete(int id);
        IEnumerable<AutocompleteItem> GetAutocompleteList(string term);
    }
}
