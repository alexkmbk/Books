/// <reference path="./books.dialog.ts" />

import * as BookDialog from "./books.dialog";

var books_table: Table;

function InitBooksTable() {

    var cols: Column[] = [new Column({ name: "Id", isVisible: false }),
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

InitBooksTable();

window.addEventListener("books_table_Pick", function (e: any) {
    var rowdata: Array<any> = e.detail;
    BookDialog.OpenEditDialog(false, rowdata['Id'],  window);
});

window.addEventListener("books_table_New", function (e: any) {
    BookDialog.OpenEditDialog(true, null, window);
});

//Удалить запись
window.addEventListener("books_table_BeforeDelete", function (e: any) {
    var rowdata: Array<any> = e.detail;
    $.ajax({
        type: 'POST',
        url: 'Books/Delete',
        data: { Id: rowdata['Id']},
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

window.addEventListener("books_table_AfterSave", function (e: any) {
    InitBooksTable();
});