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
    BookDialog.OpenEditDialog(false, rowdata['Id'], rowdata['Name'], rowdata['Description'], rowdata['PublisherId'], rowdata['Price'], rowdata['PublishedAt'],  window);
});

window.addEventListener("books_table_New", function (e: any) {
    BookDialog.OpenEditDialog(true, null, null, null, null, null, null, window);
});

//Удалить запись
window.addEventListener("books_table_BeforeDelete", function (e: any) {
    window.location.href = "/Books/Delete?Id=" + e.detail['Id'];
});

window.addEventListener("books_table_AfterSave", function (e: any) {
    InitBooksTable();
});