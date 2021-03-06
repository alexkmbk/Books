﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;
using Books.Models;
using NHibernate.Linq;
using NHibernate;
using Microsoft.Extensions.PlatformAbstractions;
using System.IO;
using Microsoft.AspNet.Mvc.ViewEngines;
using Microsoft.AspNet.Mvc.Rendering;
using Microsoft.AspNet.Mvc.ViewFeatures;
using Books.Models.Repository;
using Books.Models.Repository.NHibernate;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Books.Controllers
{
    public class BooksController : Controller
    {
        private IBookShopUnitOfWork unitOfWork;

        public BooksController(IBookShopUnitOfWork _unitOfWork = null, IApplicationEnvironment appEnvironment = null)
        {
            if (_unitOfWork==null) unitOfWork = new BookShopUnitOfWork(appEnvironment);  
            else unitOfWork = _unitOfWork;
        }

        // Функция для формирования html кода по переданному шаблону вида и модели
        // результат возвращается в виде строки
        // это позволяет передавать готовый html код в ответ на ajax запросы с клиента
        public string RenderPartialViewToString(string viewName, object model)
        {
            return Global.RenderPartialViewToString(this, viewName, model);
        }


        // GET: /<controller>/
        public IActionResult Index(int AuthorId, int PublisherId, bool ajax = false)
        {
            List<Book> books = unitOfWork.BookRep.GetBooks(AuthorId, PublisherId).ToList();

            if (ajax)
                return Json(new { isOk = true, Errors = "", view = RenderPartialViewToString("_Table", books) });
            else
            {
                ViewData["title"] = "Books";
                return View(books);
            }

        }

        [HttpPost]
        public ActionResult Create(string name, string description, int PublisherId, float price, DateTime publishedAt, List<Author> Authors)
        {
            Book book = new Book();
            try
            {
                var transaction = unitOfWork.BeginTransaction();

                book.Name = name;
                book.Description = description;
                book.Price = price;
                book.PublishedAt = publishedAt;
                if (PublisherId != 0)
                {
                    var publisher = unitOfWork.PublisherRep.GetPublisher(PublisherId);
                    if (publisher == null) return Json(new { isOk = false, Errors = "The publisher was not found by given Id." });

                    book.publisher = publisher;
                }

                if (Authors != null)
                {
                    book.Authors = Authors;
                }
                unitOfWork.BookRep.Create(book);
                transaction.Commit();

                return Json(new { isOk = true, Errors = "", Id = book.Id, view = RenderPartialViewToString("_Table", unitOfWork.BookRep.GetBooks().ToList()) });
            }
            catch (Exception exc)
            {
                return Json(new { isOk = false, Errors = exc.Message });
            }
        }

        [HttpPost]
        public ActionResult Update(int BookId, string Name, string Description, int PublisherId, float Price, DateTime PublishedAt, List<Author> Authors)
        {
            try
            {
                var transaction = unitOfWork.BeginTransaction();

                Book book = unitOfWork.BookRep.GetBook(BookId);
                if (book == null) return Json(new { isOk = false, Errors = "The book was not found by given Id." });
                book.Name = Name;
                book.Description = Description;
                book.Price = Price;
                book.PublishedAt = PublishedAt;
                if (PublisherId != 0)
                {
                    var publisher = unitOfWork.PublisherRep.GetPublisher(PublisherId);
                    if (publisher == null) return Json(new { isOk = false, Errors = "The publisher was not found by given Id." });

                    book.publisher = publisher;
                }

                if (Authors != null)
                {
                    book.Authors = Authors;
                }
                unitOfWork.BookRep.Update(book);
                transaction.Commit();
                return Json(new { isOk = true, Errors = "", view = RenderPartialViewToString("_Table", unitOfWork.BookRep.GetBooks()) });

            }
            catch (Exception exc)
            {
                return Json(new { isOk = false, Errors = exc.Message });
            }
        }

        [HttpPost]
        public ActionResult Delete(int id)
        {
            try
            {
                var transaction = unitOfWork.BeginTransaction();
                unitOfWork.BookRep.Delete(id);
                transaction.Commit();
                return Json(new { isOk = true, Errors = "" });
            }
            catch (Exception exc)
            {
                return Json(new { isOk = false, Errors = exc.Message });
            }
        }

        public IActionResult GetBookAuthorsForEdit(int bookId)
        {
        
                ViewBag.Title = "Authors";
                ViewBag.BookId = bookId;

                var authors = unitOfWork.BooksToAuthorsRep.GetAuthors(bookId);

                return Json(new { isOk = true, Errors = "", view = RenderPartialViewToString("_AuthorsTable", authors) });
        }

        [HttpPost]
        public ActionResult AddAuthorToBook(int AuthorId, int BookId)
        {
            try
            {
                BooksToAuthors booksToAuthors = new BooksToAuthors();
                booksToAuthors.IdAuthor = AuthorId;
                booksToAuthors.IdBook = BookId;
                var transaction = unitOfWork.BeginTransaction();
                unitOfWork.BooksToAuthorsRep.Create(booksToAuthors);
                transaction.Commit();

                return Json(new { isOk = true, Errors = "" });
            }
            catch (Exception exc)
            {
                return Json(new { isOk = false, Errors = exc.Message });
            }
        }

        [HttpPost]
        public ActionResult DeleteAuthorFromBook(int AuthorId, int BookId)
        {
            try
            {
                var transaction = unitOfWork.BeginTransaction();
                unitOfWork.BooksToAuthorsRep.Delete(BookId, AuthorId);
                transaction.Commit();

                return Json(new { isOk = true, Errors = "" });
            }
            catch (Exception exc)
            {
                return Json(new { isOk = false, Errors = exc.Message });
            }
        }
        

        // Возвращает диалог редактирования книги
        [HttpGet]
        public IActionResult GetDialog(int Id, bool isNew)
        {
            string publisherName = "";
            int? publisherId = 0;
            string title = "";

            Book book = unitOfWork.BookRep.GetBook(Id);
            if (book != null)
            {
                var publisher = unitOfWork.PublisherRep.GetPublisher(book.publisher.Id);
                if (publisher != null)
                {
                    publisherName = publisher.Name;
                    publisherId = publisher.Id;
                }
                if (isNew) title = "New book";
                else title = book.Name;
            }
            else book = new Book();
            ViewData["PublisherName"] = publisherName;
            ViewData["PublisherId"] = publisherId;
            ViewData["Title"] = title;

            return Json(new { isOk = true, Errors = "", view = RenderPartialViewToString("Dialog", book) });
        }

        [HttpGet]
        public ActionResult GetAutocompleteList(string term)
        {
            try
            {

                return Json(unitOfWork.BookRep.GetAutocompleteList(term));

            }
            catch (Exception exc)
            {
                return Json(new { isOk = false, Errors = exc.Message });
            }
        }

        // Форма выбора издателей
        [HttpGet]
        public IActionResult GetChoiceForm()
        {
            ViewData["title"] = "Books";
            return Json(new { isOk = true, Errors = "", view = RenderPartialViewToString("ChoiceForm", unitOfWork.BookRep.GetBooks()) });

        }

        public IActionResult Error()
        {
            return View();
        }
    }
}
