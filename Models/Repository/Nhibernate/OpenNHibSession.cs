using Microsoft.AspNet.Http;
using Microsoft.Extensions.PlatformAbstractions;
using NHibernate;
using NHibernate.Cfg;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;

namespace Books.Models.Repository.NHibernate
{
    public class OpenNHibSession
    {
       public static ISessionFactory sessionFactory;

        public static ISession OpenSession(IApplicationEnvironment _appEnvironment)
        {
            if (sessionFactory == null)
            {
                var configuration = new Configuration();
                var configurationPath = Path.Combine(_appEnvironment.ApplicationBasePath, @"Models\Repository\Nhibernate\hibernate.cfg.xml");
                configuration.Configure(configurationPath);
                configuration.AddFile(Path.Combine(_appEnvironment.ApplicationBasePath, @"Models\Repository\Nhibernate\Mapping\book.mapping.xml"));
                configuration.AddFile(Path.Combine(_appEnvironment.ApplicationBasePath, @"Models\Repository\Nhibernate\Mapping\author.mapping.xml"));
                configuration.AddFile(Path.Combine(_appEnvironment.ApplicationBasePath, @"Models\Repository\Nhibernate\Mapping\publisher.mapping.xml"));
                configuration.AddFile(Path.Combine(_appEnvironment.ApplicationBasePath, @"Models\Repository\Nhibernate\Mapping\bookstoauthors.mapping.xml"));

                sessionFactory = configuration.BuildSessionFactory();
            }
            return sessionFactory.OpenSession();
        }
    }
}
