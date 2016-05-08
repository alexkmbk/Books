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
        },
        close: function () {
            $(this).dialog('destroy').remove();
            dlg = undefined;
        }
    });

    var cols: Column[] = [new Column({ name: "Id", isVisible: false }),
        new Column({ name: "Name", isVisible: true, isAutoComplete: true, AutoCompleteSource: "Authors/GetAutocompleteAuthorsList", AutoCompleteID: "Id", isChoiceForm: true })];
    authors_table = new Table("authors_table", true, cols, dlg, cols[0], 200);

    var panel = $("#authors_panel");
    panel.find("input[name='NewButton']").get(0).onclick = authors_table.Add;
    panel.find("input[name='EditButton']").get(0).onclick = authors_table.Edit;
    panel.find("input[name='DeleteButton']").get(0).onclick = authors_table.BeforeDelete;

    //Удалить запись
    dlg.get(0).addEventListener("authors_table_BeforeDelete", function (e: any) {

        var rowdata: Array<any> = e.detail;
        $.ajax({
            type: 'POST',
            url: 'Books/DeleteAuthorFromBook',
            data: { BookId: bookId, AuthorId: rowdata['Id'] },
            success: function (data) {
                if (data["isOk"]) {
                    authors_table.Delete(); // удалить строку в диалоге
                }
                else {
                    msg("Ошибка записи: " + data["Errors"]);
                }
            },
            error: function (xhr, str) {
                msg("Ошибка записи: " + xhr.responseText);
            }
        });
    });

    dlg.get(0).addEventListener("authors_table_SaveTable", function (e: any) {
        authors_table.EndEditing();
    }
    );

    authors_table.elem.addEventListener("authors_table_ChoiceFormClick_Name", function (e: any) {
        AuthorsChoiceDialog.OpenAuthorsChoiceDialog($("#dialog_authors"), function (rowData: any) {
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
export function OpenEditDialog(_isNew: boolean, _Id = null, _parentForm: Window) {

    parentForm = _parentForm;

    // Удалим ранее созданный диалог, чтобы очистить все свойства
    //if ($('div[aria-describedby="dialog_book"]').length>0) {
    //    return;
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
                $("#form_book").get(0).addEventListener('submit', SaveAndClose);

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
                            if (authors_table != undefined) authors_table.removeEventListeners();
                            InitDialog();
                        }
                        else {
                            msg("Ошибка полученния списка банковских счетов: " + data["Errors"]);
                        }
                    },
                    // если запрос не удалось обработать
                    error: function (xhr, str) {
                        msg("Ошибка полученния списка банковских счетов: " + xhr.responseText);
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

   var action: string;
    
   // Здесь по атрибуту isNew, определяется что это новая запись или уже существующая
    // в зависимости от этого будет вызываться различный метод контроллера: Add или Update
    if (isNew) action = 'Books/Create';
    else action = 'Books/Update?BookId=' + bookId;

    var formData = $('#form_book').serialize();
    
    var authorsArray = authors_table.GetData();
    var authors = new Array();
    for (var i = 0; i < authorsArray.length; i++) {
        authors[i] = { Id: authorsArray[i]['Id'], Name: authorsArray[i]['Name'] };
    }

    formData = formData + '&' + $.param({ 'Authors': authors});

    $.ajax({
        type: 'POST',
        url: action,
        data: formData,
        success: function (data) {
            // Если запрос выполнен без ошибок то присваиваем полученный с сервера html код
            if (data["isOk"]) {

                var event = new CustomEvent("books_table_BeforeDataReceive");
                parentForm.dispatchEvent(event);

                if (close) {
                    if (dlg != undefined) dlg.dialog('close');                
                    $('#books_table_div').html(data["view"]);
                    $('#books_table_input').focus();
                }
                else {
                    $('#books_table_div').html(data["view"]);
                    if (isNew) {
                        bookId = data["Id"];
                    }
                }
                var event = new CustomEvent("books_table_AfterSave");
                parentForm.dispatchEvent(event);
            }
            else {
                msg("Ошибка записи: " + data["Errors"]);
            }
        },
        statusCode: {
            401: function (response) {
                document.location.hostname = "/Account/Login?returnUrl=/Books/Index";
            }
        },
        // если запрос не удалось обработать
        error: function (xhr: any, str) {
            msg("Ошибка записи: " + xhr.responseCode);
        }
    });

}
  


