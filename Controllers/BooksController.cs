using System;
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

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Books.Controllers
{
    public class BooksController : Controller
    {
        private readonly IApplicationEnvironment _appEnvironment;

        public BooksController(IApplicationEnvironment appEnvironment)
        {
            _appEnvironment = appEnvironment;
        }

        // Функция для формирования html кода по переданному шаблону вида и модели
        // результат возвращается в виде строки
        // это позволяет передавать готовый html код в ответ на ajax запросы с клиента
        public string RenderPartialViewToString(string viewName, object model)
        {
            if (string.IsNullOrEmpty(viewName))
                viewName = ActionContext.ActionDescriptor.Name;

            ViewData.Model = model;

            using (StringWriter sw = new StringWriter())
            {
                var engine = Resolver.GetService(typeof(ICompositeViewEngine)) as ICompositeViewEngine;
                ViewEngineResult viewResult = engine.FindPartialView(ActionContext, viewName);

                ViewContext viewContext = new ViewContext(ActionContext, viewResult.View, ViewData, TempData, sw, new HtmlHelperOptions());

                var t = viewResult.View.RenderAsync(viewContext);
                t.Wait();

                return sw.GetStringBuilder().ToString();
            }
        }

        // GET: /<controller>/
        public IActionResult Index()
        {
            ISession session = OpenNHibertnateSession.OpenSession(_appEnvironment);

            var books = session.Query<Book>().ToList();
            return View(books);

        }

        [HttpPost]
        public ActionResult Create(string name, string description, int PublisherId, float price, DateTime publishedAt)
        {
            try
            {
                using (ISession session = OpenNHibertnateSession.OpenSession(_appEnvironment))
                {
                    using (ITransaction transaction = session.BeginTransaction())
                    {
                        Book book = new Book();
                        book.Name = name;
                        book.Description = description;
                        book.Price = price;
                        book.PublishedAt = publishedAt;
                        if (PublisherId != 0)
                        {
                            var publisher = session.Get<Publisher>(PublisherId);
                            if (publisher == null) return Json(new { isOk = false, Errors = "The publisher was not found by given Id." });

                            book.publisher = publisher;
                        }


                        session.Save(book);
                        transaction.Commit();
                    }
                }

                return Json(new { isOk = true, Errors = "" });
            }
            catch (Exception exc)
            {
                return Json(new { isOk = false, Errors = exc.Message});
            }
        }

        [HttpPost]
        public ActionResult Update(int BookId, string name, string description, int PublisherId, float price, DateTime PublishedAt)
        {
            try
            {
                using (ISession session = OpenNHibertnateSession.OpenSession(_appEnvironment))
                {
                    using (ITransaction transaction = session.BeginTransaction())
                    {
                        Book book = session.Get<Book>(BookId);
                        if (book==null) return Json(new { isOk = false, Errors = "The book was not found by given Id." });
                        book.Name = name;
                        book.Description = description;
                        book.Price = price;
                        book.PublishedAt = PublishedAt;
                        if (PublisherId != 0)
                        {
                            var publisher = session.Get<Publisher>(PublisherId);
                            if (publisher == null) return Json(new { isOk = false, Errors = "The publisher was not found by given Id." });

                            book.publisher = publisher;
                        }


                        session.Update(book);
                        transaction.Commit();
                    }
                }

                return Json(new { isOk = true, Errors = "" });
            }
            catch (Exception exc)
            {
                return Json(new { isOk = false, Errors = exc.Message });
            }
        }

        public IActionResult GetBookAuthorsForEdit(int bookId)
        {
            using (ISession session = OpenNHibertnateSession.OpenSession(_appEnvironment))
            {
                var books = session.Query<Book>().ToList();

                ViewBag.Title = "Authors";
                ViewBag.BookId = bookId;
                var authors = (from row in session.Query<BooksToAuthors>()
                               where (row.IdBook == bookId)
                               join author in session.Query<Author>() on row.IdAuthor equals author.Id
                               select new Author
                                   {
                                       Id = row.IdAuthor,
                                       Name = author.Name,
                                   });

                return Json(new { isOk = true, Errors = "", view = RenderPartialViewToString("_AuthorsTable", authors) });
            }
        }

        [HttpPost]
        public ActionResult AddAuthorToBook(int AuthorId, int BookId)
        {
            try
            {
                using (ISession session = OpenNHibertnateSession.OpenSession(_appEnvironment))
                {
                    using (ITransaction transaction = session.BeginTransaction())
                    {
                        BooksToAuthors bookToAuthors = new BooksToAuthors();
                        bookToAuthors.IdAuthor = AuthorId;
                        bookToAuthors.IdBook = BookId;
                        session.Save(bookToAuthors);
                        transaction.Commit();
                    }
                }

                return Json(new { isOk = true, Errors = "" });
            }
            catch (Exception exc)
            {
                return Json(new { isOk = false, Errors = exc.Message });
            }
        }
        

    }
}
