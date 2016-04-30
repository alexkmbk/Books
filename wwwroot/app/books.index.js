/// <reference path="./books.dialog.ts" />
System.register(["./books.dialog", "./authors_choice_dialog", "./publishers_choice_dialog"], function(exports_1) {
    var BookDialog, AuthorsChoiceDialog, PublishersChoiceDialog;
    var books_table;
    function InitBooksTable() {
        var cols = [new Column({ name: "Id", isVisible: false }),
            new Column({ name: "PublisherId", isVisible: false }),
            new Column({ name: "Name", isVisible: true }),
            new Column({ name: "Description", isVisible: true }),
            new Column({ name: "Price", isVisible: true }),
            new Column({ name: "NamePublisher", isVisible: true }),
            new Column({ name: "PublishedAt", isVisible: true }),
            new Column({ name: "Authors", isVisible: true }),
        ];
        books_table = new Table("books_table", false, cols, $(window));
        var panel = $("#books_panel");
        panel.find("input[name='AddButton']").get(0).onclick = books_table.Add;
        panel.find("input[name='EditButton']").get(0).onclick = books_table.Edit;
        panel.find("input[name='DeleteButton']").get(0).onclick = books_table.BeforeDelete;
        var filterFields = $("div[name='filters']").eq(0);
        // При изменении полей отбора, перерисуем таблицу
        function filter() {
            $.ajax({
                type: 'GET',
                url: 'Books/Index',
                data: {
                    AuthorId: filterFields.find("input[name = 'AuthorId']").val(),
                    PublisherId: filterFields.find("input[name = 'PublisherId']").val(),
                    ajax: "true" },
                success: function (data) {
                    if (data["isOk"]) {
                        $('#books_table_div').html(data["view"]);
                        InitBooksTable();
                    }
                }
            });
        }
        SetRefInput("AuthorName", "AuthorId", filterFields.find("div[name = 'Author']"), "Authors/GetAutocompleteAuthorsList", true, filter);
        filterFields.find("div[name = 'Author']").get(0).addEventListener("AuthorName_ChoiceFormClick", function (e) {
            AuthorsChoiceDialog.OpenAuthorsChoiceDialog(panel.find("div[name = 'dialog_authors_choice']"), function (rowData) {
                filterFields.find("input[name = 'AuthorName']").val(rowData["Name"]);
                filterFields.find("input[name = 'AuthorId']").val(rowData["Id"]);
                filter();
            }, function () {
                //accountdialog_table.choiceFormIsOpen = false;
            });
            return false;
        });
        SetRefInput("PublisherName", "PublisherId", filterFields.find("div[name = 'Publisher']"), "Publishers/GetAutocompletePublishersList", true, filter);
        filterFields.find("div[name = 'Publisher']").get(0).addEventListener("PublisherName_ChoiceFormClick", function (e) {
            PublishersChoiceDialog.OpenPublishersChoiceDialog(panel.find("div[name = 'dialog_publishers_choice']"), function (rowData) {
                filterFields.find("input[name = 'PublisherName']").val(rowData["Name"]);
                filterFields.find("input[name = 'PublisherId']").val(rowData["Id"]);
                filter();
            }, function () {
                //accountdialog_table.choiceFormIsOpen = false;
            });
            return false;
        });
    }
    return {
        setters:[
            function (BookDialog_1) {
                BookDialog = BookDialog_1;
            },
            function (AuthorsChoiceDialog_1) {
                AuthorsChoiceDialog = AuthorsChoiceDialog_1;
            },
            function (PublishersChoiceDialog_1) {
                PublishersChoiceDialog = PublishersChoiceDialog_1;
            }],
        execute: function() {
            InitBooksTable();
            window.addEventListener("books_table_Pick", function (e) {
                var rowdata = e.detail;
                BookDialog.OpenEditDialog(false, rowdata['Id'], window);
            });
            window.addEventListener("books_table_New", function (e) {
                BookDialog.OpenEditDialog(true, null, window);
            });
            //Удалить запись
            window.addEventListener("books_table_BeforeDelete", function (e) {
                var rowdata = e.detail;
                $.ajax({
                    type: 'POST',
                    url: 'Books/Delete',
                    data: { Id: rowdata['Id'] },
                    success: function (data) {
                        if (data["isOk"]) {
                            books_table.Delete(); // удалить строку в диалоге
                        }
                        else {
                            var myDiv = document.getElementById("dialog_book_divmsg");
                            myDiv.innerHTML = "Ошибка записи: " + data["Errors"];
                        }
                    },
                    error: function (xhr, str) {
                        var myDiv = document.getElementById("dialog_book_divmsg");
                        myDiv.innerHTML = "Ошибка записи: " + xhr.responseText;
                    }
                });
            });
            window.addEventListener("books_table_AfterSave", function (e) {
                InitBooksTable();
            });
        }
    }
});
