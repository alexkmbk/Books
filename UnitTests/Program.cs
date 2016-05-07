using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using NUnit.Framework;
using NUnitLite;
using Books;
using System.Net.Http;
using System.Net;
using Books.Models.Repository;
using Microsoft.Extensions.PlatformAbstractions;
using Books.Models;
using Books.Controllers;

namespace UnitTests
{
    class FakeBookRepository : IBookRepository
    {
        public void Create(Book item)
        {
            throw new NotImplementedException();
        }

        public void Delete(int id)
        {
            throw new NotImplementedException();
        }

        public void Dispose()
        {
            throw new NotImplementedException();
        }

        public IEnumerable<AutocompleteItem> GetAutocompleteList(string term)
        {
            throw new NotImplementedException();
        }

        public Book GetBook(int? id)
        {
            throw new NotImplementedException();
        }

        public IEnumerable<Book> GetBooks(int AuthorId, int PublisherId)
        {
            return new List<Book>() {
                new Book(){ Id = 1, Name ="test" },
            };
        }

        public void Update(Book item)
        {
            throw new NotImplementedException();
        }
    }

    public class FakeTransaction : IBookShopTransaction
    {
        public void Commit()
        {
            
        }
    }

    public class FakeBookShopUnitOfWork : IBookShopUnitOfWork
    {
  
        public IAuthorRepository AuthorRep
        {
            get
            {
                throw new NotImplementedException();
            }
        }

        public IBookRepository BookRep
        {
            get
            {
                return new FakeBookRepository();
            }
        }

        public IBooksToAuthorsRepository BooksToAuthorsRep
        {
            get
            {
                throw new NotImplementedException();
            }
        }

        public IPublisherRepository PublisherRep
        {
            get
            {
                throw new NotImplementedException();
            }
        }

        public IBookShopTransaction BeginTransaction()
        {
            return new FakeTransaction();
        }
    }

    public class Program
    {
        public static void Main(string[] args)
        {
        #if DNX451
                    new AutoRun().Execute(args);
        #else
               // new AutoRun().Execute(typeof(Program).GetTypeInfo().Assembly, Console.Out, Console.In, args);
        #endif
        }
    }

    [TestFixture]
    public class BooksUnitTests
    {
        [Test]
        // проверка на то, что если вернуть корректный список книг, то не должно быть исключений 
        public void GetBooks_FakeClient_Ok()
        {
            BooksController booksController = new BooksController(new FakeBookShopUnitOfWork());
            var res = booksController.Index(0, 0, false);
        }
    }

}
