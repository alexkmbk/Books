using Microsoft.AspNet.Http;
using Microsoft.Extensions.PlatformAbstractions;
using NHibernate;
using NHibernate.Cfg;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;

namespace Books.Models.Repository.NHibernate
{
    public class Transaction : IBookShopTransaction
    {
        ITransaction transaction;

        public Transaction(ITransaction _transaction)
        {
            transaction = _transaction;
        }

        public void Commit()
        {
            transaction.Commit();
        }
    }

    public class BookShopSession : IBookShopSession
    {
        public ISession nHibernateSession;
        public BookShopSession(ISession _session)
        {
            nHibernateSession = _session;
        }

        public IBookShopTransaction BeginTransaction()
        {
            Transaction transaction = new Transaction(nHibernateSession.BeginTransaction());
            return transaction;
        }

    }

    public class OpenNHibSession
    {
       public static ISessionFactory sessionFactory;

        public static BookShopSession OpenSession(IApplicationEnvironment _appEnvironment)
        {
            if (sessionFactory == null)
            {
                var configuration = new Configuration();
                var configurationPath = Path.Combine(_appEnvironment.ApplicationBasePath, @"Models\Repository\Nhibernate\hibernate.cfg.xml");
                configuration.Configure(configurationPath);
                configuration.AddFile(Path.Combine(_appEnvironment.ApplicationBasePath, @"Models\Repository\Nhibernate\Mapping\book.mapping.xml"));
                configuration.AddFile(Path.Combine(_appEnvironment.ApplicationBasePath, @"Models\Repository\Nhibernate\Mapping\author.mapping.xml"));
                configuration.AddFile(Path.Combine(_appEnvironment.ApplicationBasePath, @"Models\Repository\Nhibernate\Mapping\publisher.mapping.xml"));
                configuration.AddFile(Path.Combine(_appEnvironment.ApplicationBasePath, @"Models\Repository\Nhibernate\Mapping\bookstoauthors.mapping.xml"));

                sessionFactory = configuration.BuildSessionFactory();
            }
            BookShopSession session = new BookShopSession(sessionFactory.OpenSession());
            return session;
        }
    }
}
