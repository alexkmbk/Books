using Microsoft.AspNet.Mvc;
using Microsoft.AspNet.Mvc.Rendering;
using Microsoft.AspNet.Mvc.ViewEngines;
using Microsoft.AspNet.Mvc.ViewFeatures;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Books
{
    static public class Global
    {
        // Функция для формирования html кода по переданному шаблону вида и модели
        // результат возвращается в виде строки
        // это позволяет передавать готовый html код в ответ на ajax запросы с клиента
        static public string RenderPartialViewToString(Controller controller, string viewName, object model)
        {
            if (string.IsNullOrEmpty(viewName))
                viewName = controller.ActionContext.ActionDescriptor.Name;

            controller.ViewData.Model = model;

            using (StringWriter sw = new StringWriter())
            {
                var engine = controller.Resolver.GetService(typeof(ICompositeViewEngine)) as ICompositeViewEngine;
                ViewEngineResult viewResult = engine.FindPartialView(controller.ActionContext, viewName);

                ViewContext viewContext = new ViewContext(controller.ActionContext, viewResult.View, controller.ViewData, controller.TempData, sw, new HtmlHelperOptions());

                var t = viewResult.View.RenderAsync(viewContext);
                t.Wait();

                return sw.GetStringBuilder().ToString();
            }
        }
    }
}
