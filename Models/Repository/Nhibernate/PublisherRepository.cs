using Microsoft.Extensions.PlatformAbstractions;
using NHibernate;
using NHibernate.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Books.Models.Repository.NHibernate
{
    public class PublisherRepository : IPublisherRepository
    {
        private ISession session;

        public PublisherRepository(IApplicationEnvironment appEnvironment)
        {
            session = OpenNHibSession.OpenSession(appEnvironment).nHibernateSession;
        }

        public void Create(Publisher publisher)
        {
             session.Save(publisher);             
        }

        public void Delete(int? id)
        {
            Publisher publisher = new Publisher();
            publisher.Id = id;
            session.Delete(publisher);
        }

        public void Dispose()
        {
            session.Dispose();
        }

        public Publisher GetPublisher(int? id)
        {
            return session.Get<Publisher>(id);
        }

        public IEnumerable<Publisher> GetPublishers(Book book = null)
        {
            if (book != null)
            {

                List<Publisher> publishers = new List<Publisher>();
                publishers.Add(book.publisher);
                return publishers;
            }
            else
                return session.Query<Publisher>().ToList();
        }

        public void Update(Publisher publisher)
        {
           session.Update(publisher);
        }

        public IEnumerable<AutocompleteItem> GetAutocompletePublishersList(string term)
        {
            return session.Query<Publisher>().Where(x => x.Name.ToLower().Contains(term.ToLower()))
            .OrderBy(x => x.Name)
            .Select(x => new AutocompleteItem { label = x.Name, value = x.Name, Id = x.Id }).ToList();
        }

    }
}
