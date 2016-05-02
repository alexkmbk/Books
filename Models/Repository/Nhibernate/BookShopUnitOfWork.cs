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

    public class BookShopUnitOfWork : IBookShopUnitOfWork
    {
        public ISession nHibernateSession;
        private BookRepository bookRep;
        private AuthorRepository authorRep;
        private PublisherRepository publisherRep;
        private BooksToAuthorsRepository booksToAuthorsRep;

        public BookShopUnitOfWork(IApplicationEnvironment _appEnvironment)
        {
            nHibernateSession = OpenNHibSession.OpenSession(_appEnvironment);
        }

        public BookRepository BookRep
        {
            get
            {
                if (this.bookRep == null)
                {
                    this.bookRep = new BookRepository(nHibernateSession);
                }
                return bookRep;
            }
        }

        public AuthorRepository AuthorRep
        {
            get
            {
                if (this.authorRep == null)
                {
                    this.authorRep = new AuthorRepository(nHibernateSession);
                }
                return authorRep;
            }
        }

        public BooksToAuthorsRepository BooksToAuthorsRep
        {
            get
            {
                if (this.booksToAuthorsRep == null)
                {
                    this.booksToAuthorsRep = new BooksToAuthorsRepository(nHibernateSession);
                }
                return booksToAuthorsRep;
            }
        }

        public PublisherRepository PublisherRep
        {
            get
            {
                if (this.publisherRep == null)
                {
                    this.publisherRep = new PublisherRepository(nHibernateSession);
                }
                return publisherRep;
            }
        }

        public IBookShopTransaction BeginTransaction()
        {
            Transaction transaction = new Transaction(nHibernateSession.BeginTransaction());
            return transaction;
        }

    }
}
