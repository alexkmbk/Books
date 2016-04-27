///<reference path="../lib/jquery/jqueryui.d.ts" />
///<reference path="../lib/jquery/jquery.d.ts" />

import * as AuthorsChoiceDialog from "./authors_choice_dialog";
import * as PublishersChoiceDialog from "./publishers_choice_dialog";

var autoComplete, input: JQuery;
var dlg: JQuery;
var saving: boolean = false;
var isNew: boolean = false;
var bookId: number;
var authors_table: Table;
var parentForm: any;

function SetDialogActive(dlg: JQuery, data) {

    $('#authors_table_div :input').removeAttr('disabled');
    $('#authors_table_div').removeClass('disabled');
    isNew = false;
}

function InitDialog() {
    
    dlg.dialog({
        width: "60%",
        beforeClose: function (e: any, ui) {

            // если нажата клавиша ESC и выполняется редактирование ячейки,
            // то необходимо завершить редактирование не сохраняя введенные данные
            if (e.keyCode == 27) {
                if (authors_table.inEditing) {
                    e.preventDefault();
                    authors_table.EndEditing();
                    $("#authors_table_input").focus();
                }
            }
        }
    });

    var cols: Column[] = [new Column({ name: "Id", isVisible: false }),
        new Column({ name: "Name", isVisible: true, isAutoComplete: true, AutoCompleteSource: "Authors/GetAutocompleteAuthorsList", AutoCompleteID: "Id", isChoiceForm: true })];
    authors_table = new Table("authors_table", true, cols, dlg, cols[0], 200);

    var panel = $("#authors_panel");
    panel.find("input[name='NewButton']").get(0).onclick = authors_table.Add;
    panel.find("input[name='EditButton']").get(0).onclick = authors_table.Edit;
    panel.find("input[name='DeleteButton']").get(0).onclick = authors_table.BeforeDelete;

    $("#form_book").get(0).onsubmit = SaveAndClose;

    //Удалить запись
    dlg.get(0).addEventListener("authors_table_BeforeDelete", function (e: any) {

        var rowdata: Array<any> = e.detail;
        $.ajax({
            type: 'POST',
            url: 'Books/DeleteAuthorFromBook',
            data: { BookId: rowdata['BookId'], AuthorId: rowdata['AuthorId']},
            success: function (data) {
                if (data["isOk"]) {
                    authors_table.Delete(); // удалить строку в диалоге
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

    dlg.get(0).addEventListener("authors_table_SaveTable", function (e: any) {

        var action;
        var rowdata;

        if (saving) return;

        saving = true;

        action = 'Books/AddAuthorToBook';
        rowdata = { AuthorId: e.detail["AuthorId"], BookId: bookId }
        $.ajax({
            type: 'POST',
            url: action,
            data: rowdata,
            success: function (data) {
                if (data["isOk"]) {
                    authors_table.EndEditing(data["AuthorId"]);
                    saving = false;
                }
                else {
                    var myDiv = document.getElementById("dialog_book_divmsg");
                    myDiv.innerHTML = "Ошибка записи: " + data["Errors"];
                    saving = false;
                }
            },
            error: function (xhr, str) {
                var myDiv = document.getElementById("dialog_book_divmsg");
                myDiv.innerHTML = "Ошибка записи: " + xhr.responseText;
                saving = false;
            }
        });
    });

    authors_table.elem.addEventListener("authors_table_ChoiceFormClick_Name", function (e: any) {
        AuthorsChoiceDialog.OpenBanksChoiceDialog($("#dialog_authors"), function (rowData: any) {
            authors_table.SetInputValue("Id", rowData["Id"]);
            authors_table.SetInputValue("Name", rowData["Name"]);
        },
            function () {
                authors_table.choiceFormIsOpen = false;
        });
        return false;
    });



}

// Открывает диалог редактирования свойств
export function OpenEditDialog(_isNew: boolean, _Id = null, Name = null, Description = null, PublisherId = null, Price = null, PublishedAt = null, _parentForm: Window) {

    parentForm = _parentForm;

    // Удалим ранее созданный диалог, чтобы очистить все свойства
   // if (dlg.hasClass('ui-dialog-content')) {
     //   dlg.dialog('destroy');
        //dlg.find("input[type='text']").val("");
    //}

    $.ajax({
        type: 'GET',
        url: 'Books/GetDialog',
        data: { 'Id': _Id, 'isNew': _isNew },
        success: function (data) {
            // Если запрос выполнен без ошибок то присваиваем полученный с сервера html код, элементу authorsTable
            if (data["isOk"]) {
                $('#dialog_book_div').html(data["view"]);
                dlg = $("#dialog_book");

                // Если  нажато сочетание ctrl+Enter тогда сохраняем данные и закрываем диалог
                dlg.keypress(function (e) {
                    if (e.ctrlKey && e.keyCode == 10) {
                        e.preventDefault();
                        SaveChanges();
                    }
                });

                var panel = $("#dialog_book_panel");
                panel.find("input[name='SaveAndCloseButton']").get(0).onclick = SaveAndClose;
                panel.find("input[name='SaveButton']").get(0).onclick = Save;

                // Ссылочное поле с выбором издателя из таблицы Publishers
                // Здесь реализуется возможность выбора с помощью автокомплита и формы выбора
                var fields = dlg.find("div[name='fields']").eq(0);
                SetRefInput("PublisherName", "PublisherId", fields, "Publishers/GetAutocompletePublishersList", true);

                fields.get(0).addEventListener("PublisherName_ChoiceFormClick", function (e: any) {
                    PublishersChoiceDialog.OpenPublishersChoiceDialog($("#dialog_publishers"), function (rowData: any) {
                        fields.find("input[name = 'PublisherName']").val(rowData["Name"]);
                        fields.find("input[name = 'PublisherId']").val(rowData["Id"]);
                    },
                        function () {
                            //accountdialog_table.choiceFormIsOpen = false;
                        });
                    return false;
                });    

                // Установим Datepicker
                fields.find("input[name='PublishedAt']").datepicker({
                    dateFormat: "yy-mm-dd",
                });

                bookId = _Id;

               /* if (!_isNew) {

                    dlg.find("input[name='Name']").val(Name);
                    dlg.find("input[name='Id']").val(_Id);
                    dlg.find("input[name='Description']").val(Description);
                    dlg.find("input[name='Price']").val(Price);
                    dlg.find("input[name='PublisherId']").val(PublisherId);
                    dlg.find("input[name='PublishedAt']").val(PublishedAt);
                    dlg.attr('title', 'Book ' + Name);
                    bookId = _Id;
                    var PublisherName;
                    $.ajax({
                        async: false,
                        type: 'GET',
                        url: 'Publishers/GetName',
                        data: { 'Id': PublisherId },
                        success: function (data) { PublisherName = data["name"] }
                    });
                    dlg.find("input[name='PublisherName']").val(PublisherName);
                }
                else
                    dlg.attr('title', 'Add new book');*/

                isNew = _isNew;
    
                // заполним таблицу авторов, здесь повторный вызов сервера, надо бы перенести все это на сервер
                $.ajax({
                    type: 'GET',
                    url: 'Books/GetBookAuthorsForEdit',
                    data: { 'bookId': bookId },
                    success: function (data) {
                        // Если запрос выполнен без ошибок то присваиваем полученный с сервера html код, элементу authorsTable
                        if (data["isOk"]) {
                            $('#authors_table_div').html(data["view"]);
                            InitDialog();
                            if (isNew) {
                                // Установим все поля ввода авторов неактивными, поскольку книга еще не записана в базу
                                $('#authors_table_div :input').attr('disabled', "true");
                                $('#authors_table_div').addClass('disabled');
                            }
                            else SetDialogActive(dlg, data);

                        }
                        else {
                            // Если запрос обработан, но произошла ошибка, то устанавливаем текст ошибки в элементе dialog_customer_divmsg
                            //расположенном здесь, же на форме диалога, чтобы пользователь мог видеть сообщение
                            var myDiv = document.getElementById("dialog_book_divmsg");
                            myDiv.innerHTML = "Ошибка полученния списка банковских счетов: " + data["Errors"];
                        }
                    },
                    // если запрос не удалось обработать
                    error: function (xhr, str) {
                        var myDiv = document.getElementById("dialog_book_divmsg");
                        myDiv.innerHTML = "Ошибка полученния списка банковских счетов: " + xhr.responseText;
                    }
                });
            }
        }
    });


}




export function Save() {
    SaveChanges(false);
}

export function SaveAndClose() {
    SaveChanges(true);
}

// Save changes
function SaveChanges(close: boolean = false) {
  
    var myDiv = document.getElementById("dialog_book_divmsg");
    myDiv.innerHTML = "";

    // Здесь по атрибуту isNew, определяется что это новая запись или уже существующая
    // в зависимости от этого будет вызываться различный метод контроллера: Add или Update
    var action: string;
    

    if (isNew) action = 'Books/Create';
    else action = 'Books/Update?BookId=' + bookId;

    var msg = $('#form_book').serialize();
    $.ajax({
        type: 'POST',
        url: action,
        data: msg,
        success: function (data) {
            // Если запрос выполнен без ошибок то присваиваем полученный с сервера html код, элементу customers_table
            if (data["isOk"]) {
                if (close) {
                    alert("dlg.dialog('close')");
                    dlg.dialog('close');                
                    $('#books_table_div').html(data["view"]);
                    $('#books_table_input').focus();
                    dlg.dialog('destroy');
                }
                else {
                    $('#books_table_div').html(data["view"]);
                    if (isNew) {
                        bookId = data["BookId"];
                        SetDialogActive(dlg, data);
                    }
                }
                var event = new CustomEvent("books_table_AfterSave");
                parentForm.dispatchEvent(event);
            }
            else {
                //Если запрос обработан, но произошла ошибка, то устанавливаем текст ошибки в элементе dialog_customer_divmsg
                //расположенном здесь, же на форме диалога, чтобы пользователь мог видеть сообщение
                var myDiv = document.getElementById("dialog_book_divmsg");
                myDiv.innerHTML = "Ошибка записи: " + data["Errors"];
            }
        },
        statusCode: {
            401: function (response) {
                document.location.hostname = "/Account/Login?returnUrl=/Books/Index";
            }
        },
        // если запрос не удалось обработать
        error: function (xhr: any, str) {
            var myDiv = document.getElementById("dialog_book_divmsg");
            myDiv.innerHTML = "Ошибка записи: " + xhr.responseCode;
        }
    });

}
  

function msg(str) {
    var myDiv = document.getElementById("dialog_book_divmsg");
    myDiv.innerHTML = str;
}

