using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;

using Books.Models;
using NHibernate;
using NHibernate.Linq;
using Microsoft.Extensions.PlatformAbstractions;
using System.IO;
using Microsoft.AspNet.Mvc.ViewEngines;
using Microsoft.AspNet.Mvc.Rendering;
using Microsoft.AspNet.Mvc.ViewFeatures;


// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Books.Controllers
{
    public class PublishersController : Controller
    {
        private readonly IApplicationEnvironment _appEnvironment;

        public PublishersController(IApplicationEnvironment appEnvironment)
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

        [HttpGet]
        public IActionResult Index(int BookId, bool ajax = false)
        {
            List<Publisher> publishers = new List<Publisher>();
            ISession session = OpenNHibertnateSession.OpenSession(_appEnvironment);

            if (BookId != 0)
            {
                var book = session.Get<Book>(BookId);
                if (book == null)
                {
                    if (ajax) return Json(new { isOk = false, Errors = "It seems like there is no book with Id=" + BookId, view = RenderPartialViewToString("_Table", new List<Publisher>()) });
                    else return View(new List<Publisher>());
                }
                else if (book.publisher == null)
                {
                    if (ajax) return Json(new { isOk = true, Errors = "No publishers whre found by given book Id", view = RenderPartialViewToString("_Table", new List<Publisher>()) });
                    else return View(new List<Publisher>());

                }
                else
                {
                    publishers = new List<Publisher>();
                    publishers.Add(book.publisher);
                }

            }
            else
                publishers = session.Query<Publisher>().ToList();

            if (ajax)
                return Json(new { isOk = true, Errors = "", view = RenderPartialViewToString("_Table", publishers) });
            else
            {
                ViewData["title"] = "Publishers";
                return View(publishers);
            }

        }


        [HttpPost]
        public ActionResult Create(string name)
        {
            try
            {
                using (ISession session = OpenNHibertnateSession.OpenSession(_appEnvironment))
                {
                    using (ITransaction transaction = session.BeginTransaction())
                    {
                        Publisher publisher = new Publisher();
                        publisher.Name = name;
                        session.Save(publisher);
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

        [HttpPost]
        public ActionResult Update(string name, int id)
        {
            try
            {
                using (ISession session = OpenNHibertnateSession.OpenSession(_appEnvironment))
                {
                    using (ITransaction transaction = session.BeginTransaction())
                    {
                        Publisher publisher = new Publisher();
                        publisher.Name = name;
                        publisher.Id = id;
                        session.Update(publisher);
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

        [HttpPost]
        public ActionResult Delete(int id)
        {
            try
            {
                using (ISession session = OpenNHibertnateSession.OpenSession(_appEnvironment))
                {
                    using (ITransaction transaction = session.BeginTransaction())
                    {
                        Publisher publisher = new Publisher();
                        publisher.Id = id;
                        session.Delete(publisher);
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

        [HttpGet]
        public ActionResult GetAutocompletePublishersList(string term)
        {
            try
            {

                using (ISession session = OpenNHibertnateSession.OpenSession(_appEnvironment))
                {
                    var publishers = session.Query<Publisher>().Where(x => x.Name.ToLower().Contains(term.ToLower()))
                        .OrderBy(x => x.Name)
                        .Select(x => new { label = x.Name, value = x.Name, Id = x.Id }).ToList();

                    return Json(publishers);
                }
            }
            catch (Exception exc)
            {
                return Json(new { isOk = false, Errors = exc.Message });
            }
        }

        [HttpGet]
        public ActionResult GetName(int Id)
        {
            try
            {
                using (ISession session = OpenNHibertnateSession.OpenSession(_appEnvironment))
                {
                    var publisher = session.Get<Publisher>(Id);
                    if (publisher == null) return Json(new { isOk = false, Errors = "The author was not found by given Id." });
                    return Json(new { name = publisher.Name });
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
            using (ISession session = OpenNHibertnateSession.OpenSession(_appEnvironment))
            {
                ViewData["title"] = "Publishers";
                return Json(new { isOk = true, Errors = "", view = RenderPartialViewToString("ChoiceForm", session.Query<Publisher>()) });
            }
        }

    }
}

