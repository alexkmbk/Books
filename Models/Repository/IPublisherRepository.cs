using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Books.Models.Repository
{
    public interface IPublisherRepository : IDisposable
    {
        IEnumerable<Publisher> GetPublishers(Book book=null);
        Publisher GetPublisher(int? id);
        void Create(Publisher publisher);
        void Update(Publisher publisher);
        void Delete(int? id);
        IEnumerable<AutocompleteItem> GetAutocompletePublishersList(string term);
    }
}
