﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;

using Books.Models;
using NHibernate;
using NHibernate.Linq;
using Microsoft.Extensions.PlatformAbstractions;


// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Books.Controllers
{
    public class AuthorsController : Controller
    {
        private readonly IApplicationEnvironment _appEnvironment;

        public AuthorsController(IApplicationEnvironment appEnvironment)
        {
            _appEnvironment = appEnvironment;
        }

        // GET: /<controller>/
        public IActionResult Index()
        {
            using (ISession session = OpenNHibertnateSession.OpenSession(_appEnvironment))
            {
                ViewData["title"] = "Authors";
                return View(session.Query<Author>().ToList());
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
                        Author author = new Author();
                        author.Name = name;
                        session.Save(author);
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
                        Author author = new Author();
                        author.Name = name;
                        author.Id = id;
                        session.Update(author);
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
                        Author author = new Author();
                        author.Id = id;
                        session.Delete(author);
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
        public ActionResult GetName(int Id)
        {
            try
            {
                using (ISession session = OpenNHibertnateSession.OpenSession(_appEnvironment))
                {
                    return Json(new { name = session.Get<Author>(Id) }); 
                }

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
 
                using (ISession session = OpenNHibertnateSession.OpenSession(_appEnvironment))
                {
                    var authors = session.Query<Author>().Where(x => x.Name.ToLower().Contains(term.ToLower()))
                        .OrderBy(x => x.Name)
                        .Select(x => new { label = x.Name, value = x.Name, Id = x.Id }).ToList();

                    return Json(authors);
                }
            }
            catch (Exception exc)
            {
                return Json(new { isOk = false, Errors = exc.Message });
            }
        }
        
    }
}

