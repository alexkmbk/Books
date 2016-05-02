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
using Books.Models.Repository.NHibernate;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Books.Controllers
{
    public class PublishersController : Controller
    {

        private BookShopUnitOfWork unitOfWork;

        public PublishersController(IApplicationEnvironment appEnvironment)
        {
            unitOfWork = new BookShopUnitOfWork(appEnvironment);
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

            if (BookId != 0)
            {
                var book = unitOfWork.BookRep.GetBook(BookId);
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
                publishers = unitOfWork.PublisherRep.GetPublishers().ToList();

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
                Publisher publisher = new Publisher();
                publisher.Name = name;
                var transaction = unitOfWork.BeginTransaction();
                unitOfWork.PublisherRep.Create(publisher);
                transaction.Commit();

                return Json(new { isOk = true, Errors = "", Id = publisher.Id});
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
                Publisher publisher = new Publisher();
                publisher.Name = name;
                publisher.Id = id;
                var transaction = unitOfWork.BeginTransaction();
                unitOfWork.PublisherRep.Update(publisher);
                transaction.Commit();
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
                var transaction = unitOfWork.BeginTransaction();
                unitOfWork.PublisherRep.Delete(id);
                transaction.Commit();
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
                var publishers = unitOfWork.PublisherRep.GetAutocompletePublishersList(term);

                return Json(publishers);
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
                var publisher = unitOfWork.PublisherRep.GetPublisher(Id);
                if (publisher == null) return Json(new { isOk = false, Errors = "The author was not found by given Id." });
                return Json(new { name = publisher.Name });
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
            ViewData["title"] = "Publishers";
            return Json(new { isOk = true, Errors = "", view = RenderPartialViewToString("ChoiceForm", unitOfWork.PublisherRep.GetPublishers()) });
        }
    }
}

