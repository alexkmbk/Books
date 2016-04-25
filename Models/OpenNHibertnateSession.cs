using Microsoft.AspNet.Http;
using Microsoft.Extensions.PlatformAbstractions;
using NHibernate;
using NHibernate.Cfg;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;

namespace Books.Models
{
    public class OpenNHibertnateSession
    {
 
        public static ISession OpenSession(IApplicationEnvironment _appEnvironment)
        {
            var configuration = new Configuration();
            var configurationPath = Path.Combine(_appEnvironment.ApplicationBasePath, @"Models\Nhibernate\hibernate.cfg.xml");
            configuration.Configure(configurationPath);
            configuration.AddFile(Path.Combine(_appEnvironment.ApplicationBasePath, @"Models\Nhibernate\book.mapping.xml"));
            configuration.AddFile(Path.Combine(_appEnvironment.ApplicationBasePath, @"Models\Nhibernate\author.mapping.xml"));
            configuration.AddFile(Path.Combine(_appEnvironment.ApplicationBasePath, @"Models\Nhibernate\publisher.mapping.xml"));
            configuration.AddFile(Path.Combine(_appEnvironment.ApplicationBasePath, @"Models\Nhibernate\bookstoauthors.mapping.xml"));

            ISessionFactory sessionFactory = configuration.BuildSessionFactory();
            return sessionFactory.OpenSession();
        }
    }
}
