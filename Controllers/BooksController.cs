using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;
using Books.Models;
using NHibernate.Linq;
using NHibernate;
using Microsoft.Extensions.PlatformAbstractions;

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


        // GET: /<controller>/
        public IActionResult Index()
        {
            using (ISession session = OpenNHibertnateSession.OpenSession(_appEnvironment))
            {
                var books = session.Query<Book>().ToList();
                return View(books);
            }

        }

        [HttpPost]
        public ActionResult Create(string name, string description, int idPublisher, float price, DateTime publishedAt)
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
                        var publisher = session.Get<Publisher>(idPublisher);
                        if (publisher == null) return Json(new { isOk = false, Errors = "The publisher was not found by given Id."});
                        
                        book.publisher = publisher;
                        

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
    }
}
