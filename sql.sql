CREATE TABLE Authors
(
    Id BIGSERIAL PRIMARY KEY NOT NULL,
    Name varchar(150) NULL
);

CREATE TABLE Books
(
    Id BIGSERIAL PRIMARY KEY NOT NULL,
    Name varchar(250) NOT NULL,
    Description varchar(500) NULL,
    IdPublisher int NOT NULL,
    Price float NOT NULL,
    PublishedAt timestamp NOT NULL
);

CREATE TABLE BooksToAuthors
(
    IdBook int NOT NULL,
    IdAuthor int NOT NULL
);

CREATE TABLE Publishers
(
    Id BIGSERIAL PRIMARY KEY NOT NULL,
    Name varchar(150) NOT NULL
);


ALTER TABLE BooksToAuthors ADD CONSTRAINT PK_BooksToAuthors
PRIMARY KEY (IdBook,IdAuthor);

ALTER TABLE Books ADD CONSTRAINT FK_Books_Publishers
FOREIGN KEY (IdPublisher) REFERENCES Publishers(Id);

ALTER TABLE BooksToAuthors ADD CONSTRAINT FK_BooksToAuthors_Books
FOREIGN KEY (IdBook) REFERENCES Books(Id);

ALTER TABLE BooksToAuthors ADD CONSTRAINT FK_BooksToAuthors_Author
FOREIGN KEY (IdAuthor) REFERENCES Authors(Id);
