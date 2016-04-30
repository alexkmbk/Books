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
        public IActionResult Index(int AuthorId, int PublisherId, bool ajax = false)
        {
            List<Book> books;
            ISession session = OpenNHibertnateSession.OpenSession(_appEnvironment);

            if (AuthorId != 0 && PublisherId != 0){
                books = session.Query<Book>().Where(x => x.Authors.Contains(session.Get<Author>(AuthorId))&&x.publisher.Id==PublisherId).ToList();
            }
            else if (AuthorId!=0)
            {
                books = session.Query<Book>().Where(x => x.Authors.Contains(session.Get<Author>(AuthorId))).ToList();
            }
            else if (PublisherId != 0)
            {
                books = session.Query<Book>().Where(x => x.publisher.Id == PublisherId).ToList();
            }
            else
                books = session.Query<Book>().ToList();

            if (ajax)
                return Json(new { isOk = true, Errors = "", view = RenderPartialViewToString("_Table", books) });
            else
            {
                ViewData["title"] = "Books";
                return View(books);
            }

        }

        [HttpPost]
        public ActionResult Create(string name, string description, int PublisherId, float price, DateTime publishedAt)
        {
            Book book = new Book();
            try
            {
                using (ISession session = OpenNHibertnateSession.OpenSession(_appEnvironment))
                {
                    using (ITransaction transaction = session.BeginTransaction())
                    {
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

                return Json(new { isOk = true, Errors = "", Id=book.Id });
            }
            catch (Exception exc)
            {
                return Json(new { isOk = false, Errors = exc.Message});
            }
        }

        [HttpPost]
        public ActionResult Update(int BookId, string Name, string Description, int PublisherId, float Price, DateTime PublishedAt)
        {
            try
            {
                using (ISession session = OpenNHibertnateSession.OpenSession(_appEnvironment))
                {
                    using (ITransaction transaction = session.BeginTransaction())
                    {
                        Book book = session.Get<Book>(BookId);
                        if (book==null) return Json(new { isOk = false, Errors = "The book was not found by given Id." });
                        book.Name = Name;
                        book.Description = Description;
                        book.Price = Price;
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
                    return Json(new { isOk = true, Errors = "", view = RenderPartialViewToString("_Table", session.Query<Book>().ToList()) });
                }
                
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
                using (ISession session = OpenNHibertnateSession.OpenSession(_appEnvironment))
                {
                    using (ITransaction transaction = session.BeginTransaction())
                    {
                        Book book = new Book();
                        book.Id = id;
                        session.Delete(book);
                        transaction.Commit();
                        return Json(new { isOk = true, Errors = "" });
                    }
                }

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
                                   }).ToList();

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

        // Возвращает диалог редактирования книги
        [HttpGet]
        public IActionResult GetDialog(int Id, bool isNew)
        {
            using (ISession session = OpenNHibertnateSession.OpenSession(_appEnvironment))
            {
                string publisherName = "";
                int? publisherId = 0;
                string title = "";

                Book book = session.Get<Book>(Id);
                if (book != null)
                {
                    var publisher = session.Get<Publisher>(book.publisher.Id);
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
        }

        [HttpGet]
        public ActionResult GetAutocompleteList(string term)
        {
            try
            {
                using (ISession session = OpenNHibertnateSession.OpenSession(_appEnvironment))
                {
                    var books = session.Query<Book>().Where(x => x.Name.ToLower().Contains(term.ToLower()))
                        .OrderBy(x => x.Name)
                        .Select(x => new { label = x.Name, value = x.Name, Id = x.Id }).ToList();

                    return Json(books);
                }
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
            ISession session = OpenNHibertnateSession.OpenSession(_appEnvironment);

            ViewData["title"] = "Books";
            return Json(new { isOk = true, Errors = "", view = RenderPartialViewToString("ChoiceForm", session.Query<Book>().ToList()) });

        }

    }
}
