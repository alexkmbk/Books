///<reference path="../lib/jquery/jqueryui.d.ts" />
///<reference path="../lib/jquery/jquery.d.ts" />
System.register(["./authors_choice_dialog", "./publishers_choice_dialog"], function(exports_1) {
    var AuthorsChoiceDialog, PublishersChoiceDialog;
    var autoComplete, input, dlg, saving, isNew, bookId, authors_table, parentForm;
    function SetDialogActive(dlg, data) {
        $('#authors_table_div :input').removeAttr('disabled');
        $('#authors_table_div').removeClass('disabled');
        isNew = false;
    }
    function InitDialog() {
        dlg.dialog({
            width: "60%",
            beforeClose: function (e, ui) {
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
        var cols = [new Column({ name: "Id", isVisible: false }),
            new Column({ name: "Name", isVisible: true, isAutoComplete: true, AutoCompleteSource: "Authors/GetAutocompleteAuthorsList", AutoCompleteID: "Id", isChoiceForm: true })];
        authors_table = new Table("authors_table", true, cols, dlg, cols[0], 200);
        var panel = $("#authors_panel");
        panel.find("input[name='NewButton']").get(0).onclick = authors_table.Add;
        panel.find("input[name='EditButton']").get(0).onclick = authors_table.Edit;
        panel.find("input[name='DeleteButton']").get(0).onclick = authors_table.BeforeDelete;
        $("#form_book").get(0).onsubmit = SaveAndClose;
        //Удалить запись
        dlg.get(0).addEventListener("authors_table_BeforeDelete", function (e) {
            var rowdata = e.detail;
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
        dlg.get(0).addEventListener("authors_table_SaveTable", function (e) {
            var action;
            var rowdata;
            if (saving)
                return;
            saving = true;
            action = 'Books/AddAuthorToBook';
            rowdata = { AuthorId: e.detail["Id"], BookId: bookId };
            $.ajax({
                type: 'POST',
                url: action,
                data: rowdata,
                success: function (data) {
                    if (data["isOk"]) {
                        authors_table.EndEditing(data["Id"]);
                        saving = false;
                    }
                    else {
                        msg("Ошибка записи: " + data["Errors"]);
                        saving = false;
                    }
                },
                error: function (xhr, str) {
                    msg("Ошибка записи: " + xhr.responseText);
                    saving = false;
                }
            });
        });
        authors_table.elem.addEventListener("authors_table_ChoiceFormClick_Name", function (e) {
            AuthorsChoiceDialog.OpenAuthorsChoiceDialog($("#dialog_authors"), function (rowData) {
                authors_table.SetInputValue("Id", rowData["Id"]);
                authors_table.SetInputValue("Name", rowData["Name"]);
            }, function () {
                authors_table.choiceFormIsOpen = false;
            });
            return false;
        });
    }
    // Открывает диалог редактирования свойств
    function OpenEditDialog(_isNew, _Id, _parentForm) {
        if (_Id === void 0) { _Id = null; }
        parentForm = _parentForm;
        // Удалим ранее созданный диалог, чтобы очистить все свойства
        if ($('div[aria-describedby="dialog_book"]').length > 0) {
            return;
        }
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
                    fields.get(0).addEventListener("PublisherName_ChoiceFormClick", function (e) {
                        PublishersChoiceDialog.OpenPublishersChoiceDialog($("#dialog_publishers"), function (rowData) {
                            fields.find("input[name = 'PublisherName']").val(rowData["Name"]);
                            fields.find("input[name = 'PublisherId']").val(rowData["Id"]);
                        }, function () {
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
                                if (authors_table != undefined)
                                    authors_table.removeEventListeners();
                                InitDialog();
                                if (isNew) {
                                    // Установим все поля ввода авторов неактивными, поскольку книга еще не записана в базу
                                    $('#authors_table_div :input').attr('disabled', "true");
                                    $('#authors_table_div').addClass('disabled');
                                }
                                else
                                    SetDialogActive(dlg, data);
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
    exports_1("OpenEditDialog", OpenEditDialog);
    function Save() {
        SaveChanges(false);
    }
    exports_1("Save", Save);
    function SaveAndClose() {
        SaveChanges(true);
    }
    exports_1("SaveAndClose", SaveAndClose);
    // Save changes
    function SaveChanges(close) {
        if (close === void 0) { close = false; }
        // Здесь по атрибуту isNew, определяется что это новая запись или уже существующая
        // в зависимости от этого будет вызываться различный метод контроллера: Add или Update
        var action;
        if (isNew)
            action = 'Books/Create';
        else
            action = 'Books/Update?BookId=' + bookId;
        var formData = $('#form_book').serialize();
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
                        if (dlg != undefined)
                            dlg.dialog('close');
                        $('#books_table_div').html(data["view"]);
                        $('#books_table_input').focus();
                    }
                    else {
                        $('#books_table_div').html(data["view"]);
                        if (isNew) {
                            bookId = data["Id"];
                            SetDialogActive(dlg, data);
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
            error: function (xhr, str) {
                msg("Ошибка записи: " + xhr.responseCode);
            }
        });
    }
    return {
        setters:[
            function (AuthorsChoiceDialog_1) {
                AuthorsChoiceDialog = AuthorsChoiceDialog_1;
            },
            function (PublishersChoiceDialog_1) {
                PublishersChoiceDialog = PublishersChoiceDialog_1;
            }],
        execute: function() {
            saving = false;
            isNew = false;
        }
    }
});
