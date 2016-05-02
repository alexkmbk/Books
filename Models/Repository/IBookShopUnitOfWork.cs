using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Books.Models.Repository
{
   public interface IBookShopTransaction
    {
        void Commit();
    }

    public interface IBookShopUnitOfWork
    {
       IBookShopTransaction BeginTransaction();
    }
}
