using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Books.Models
{
    public class BooksToAuthors
    {
        public virtual int? IdBook { get; set; }
        public virtual int? IdAuthor { get; set; }

        public virtual IList<Book> Publishers { get; set; }
        public virtual IList<Author> Authors { get; set; }
    }
}
