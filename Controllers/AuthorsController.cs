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
    public class AuthorsController : Controller
    {

        private BookShopUnitOfWork unitOfWork;

        public AuthorsController(IApplicationEnvironment appEnvironment)
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

            List<Author> authors = new List<Author>();

            var transaction = unitOfWork.BeginTransaction();

            if (BookId != 0)
            {
                var book = unitOfWork.BookRep.GetBook(BookId);
                if (book == null)
                {
                    if (ajax) return Json(new { isOk = false, Errors = "It seems like there is no book with Id=" + BookId, view = RenderPartialViewToString("_Table", new List<Publisher>()) });
                    else return View(new List<Author>());
                }

                authors = unitOfWork.AuthorRep.GetAuthors(book).ToList();
            }
            else
                authors = unitOfWork.AuthorRep.GetAuthors().ToList();

            transaction.Commit();

            if (ajax)
                return Json(new { isOk = true, Errors = "", view = RenderPartialViewToString("_Table", authors) });
            else
            {
                ViewData["title"] = "Authors";
                return View(authors);
            }
        }

        [HttpPost]
        public ActionResult Create(string name)
        {
            try
            {
                    Author author = new Author();
                    author.Name = name;
                    unitOfWork.AuthorRep.Create(author);

                return Json(new { isOk = true, Errors = "", Id = author.Id});
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
                        Author author = new Author();
                        author.Name = name;
                        author.Id = id;
                        unitOfWork.AuthorRep.Update(author);

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
                unitOfWork.AuthorRep.Delete(id);
                return Json(new { isOk = true, Errors = "" });
            }
            catch (Exception exc)
            {
                return Json(new { isOk = false, Errors = exc.Message });
            }
        }

        [HttpGet]
        public ActionResult GetAutocompleteAuthorsList(string term)
        {
            try
            {
                var authors = unitOfWork.AuthorRep.GetAutocompleteList(term);
                return Json(authors);
            }
            catch (Exception exc)
            {
                return Json(new { isOk = false, Errors = exc.Message });
            }
        }

        // Форма выбора авторов
        [HttpGet]
        public IActionResult GetChoiceForm()
        {
            ViewData["title"] = "Authors";
            return Json(new { isOk = true, Errors = "", view = RenderPartialViewToString("ChoiceForm", unitOfWork.AuthorRep.GetAuthors()) });
        }

    }
}

