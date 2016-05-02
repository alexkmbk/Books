using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Books.Models
{
    public class Author
    {
        public virtual int? Id { get; set; }
        public virtual string Name { get; set; }

        public virtual IList<Book> Books { get; set; }
    }
}
