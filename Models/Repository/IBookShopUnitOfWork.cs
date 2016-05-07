namespace Books.Models.Repository
{
   public interface IBookShopTransaction
    {
        void Commit();
    }

    public interface IBookShopUnitOfWork
    {
        IBookRepository BookRep { get; }
        IAuthorRepository AuthorRep { get; }
        IPublisherRepository PublisherRep { get; }
        IBooksToAuthorsRepository BooksToAuthorsRep { get; }

        IBookShopTransaction BeginTransaction();
    }
}
