using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Books.Models
{
    public class Book
    {
        public virtual int? Id { get; set; }
        public virtual string Name { get; set; }
        public virtual string Description { get; set; }
        public virtual Publisher publisher { get; set; }
        public virtual float Price { get; set; }
        public virtual DateTime PublishedAt { get; set; }

        public virtual IList<Author> Authors { get; set; }

    }
}
