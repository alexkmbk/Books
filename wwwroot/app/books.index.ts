﻿/// <reference path="./books.dialog.ts" />

import * as BookDialog from "./books.dialog";
import * as AuthorsChoiceDialog from "./authors_choice_dialog";
import * as PublishersChoiceDialog from "./publishers_choice_dialog";

var books_table: Table;

function InitBooksTable() {

    var cols: Column[] = [new Column({ name: "Id", isVisible: false }),
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
                ajax: "true"},
            success: function (data) {
                if (data["isOk"]) {
                    $('#books_table_div').html(data["view"]);
                    InitBooksTable();
                }
            }
        });
    }

    SetRefInput("AuthorName", "AuthorId",  filterFields.find("div[name = 'Author']"), "Authors/GetAutocompleteAuthorsList", true, filter, true);

    filterFields.find("div[name = 'Author']").get(0).addEventListener("AuthorName_ChoiceFormClick", function (e: any) {
            AuthorsChoiceDialog.OpenAuthorsChoiceDialog(panel.find("div[name = 'dialog_authors_choice']"), function (rowData: any) {
            filterFields.find("input[name = 'AuthorName']").val(rowData["Name"]);
            filterFields.find("input[name = 'AuthorId']").val(rowData["Id"]);
            filter();
        },
            function () {
                //accountdialog_table.choiceFormIsOpen = false;
            });
        return false;
    });    

    SetRefInput("PublisherName", "PublisherId", filterFields.find("div[name = 'Publisher']"), "Publishers/GetAutocompletePublishersList", true, filter, true);

    filterFields.find("div[name = 'Publisher']").get(0).addEventListener("PublisherName_ChoiceFormClick", function (e: any) {
        PublishersChoiceDialog.OpenPublishersChoiceDialog(panel.find("div[name = 'dialog_publishers_choice']"), function (rowData: any) {
            filterFields.find("input[name = 'PublisherName']").val(rowData["Name"]);
            filterFields.find("input[name = 'PublisherId']").val(rowData["Id"]);
            filter();
        },
            function () {
                //accountdialog_table.choiceFormIsOpen = false;
            });
        return false;
    });    

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