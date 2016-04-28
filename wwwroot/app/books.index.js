/// <reference path="./books.dialog.ts" />
System.register(["./books.dialog"], function(exports_1) {
    var BookDialog;
    var books_table;
    function InitBooksTable() {
        var cols = [new Column({ name: "Id", isVisible: false }),
            new Column({ name: "PublisherId", isVisible: false }),
            new Column({ name: "Name", isVisible: true }),
            new Column({ name: "Description", isVisible: true }),
            new Column({ name: "Price", isVisible: true }),
            new Column({ name: "NamePublisher", isVisible: true }),
            new Column({ name: "PublishedAt", isVisible: true }),
        ];
        books_table = new Table("books_table", false, cols, $(window));
        var panel = $("#books_panel");
        panel.find("input[name='AddButton']").get(0).onclick = books_table.Add;
        panel.find("input[name='EditButton']").get(0).onclick = books_table.Edit;
        panel.find("input[name='DeleteButton']").get(0).onclick = books_table.BeforeDelete;
    }
    return {
        setters:[
            function (BookDialog_1) {
                BookDialog = BookDialog_1;
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
                window.location.href = "/Books/Delete?Id=" + e.detail['Id'];
            });
            window.addEventListener("books_table_AfterSave", function (e) {
                InitBooksTable();
            });
        }
    }
});
