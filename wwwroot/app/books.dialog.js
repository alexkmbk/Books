///<reference path="../lib/jquery/jqueryui.d.ts" />
///<reference path="../lib/jquery/jquery.d.ts" />
System.register(["./authors_choice_dialog"], function(exports_1) {
    var AuthorsChoiceDialog;
    var autoComplete, input, dlg, saving, isNew, bookId, authors_table, parentForm;
    function SetDialogActive(dlg, data) {
        $('#authors_table_div :input').removeAttr('disabled');
        $('#authors_table_div').removeClass('disabled');
        isNew = false;
        dlg.dialog('option', 'title', "Book " + $("#form_book input[name='Name']").val());
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
                data: { BookId: rowdata['BookId'], AuthorId: rowdata['AuthorId'] },
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
        dlg.get(0).addEventListener("authors_table_SaveTable", function (e) {
            var action;
            var rowdata;
            if (saving)
                return;
            saving = true;
            action = 'Books/AddAuthorToBook';
            rowdata = { AuthorId: e.detail["AuthorId"], BookId: bookId };
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
        authors_table.elem.addEventListener("authors_table_ChoiceFormClick_Name", function (e) {
            AuthorsChoiceDialog.OpenBanksChoiceDialog($("#dialog_authors"), function (rowData) {
                authors_table.SetInputValue("Id", rowData["Id"]);
                authors_table.SetInputValue("Name", rowData["Name"]);
            }, function () {
                authors_table.choiceFormIsOpen = false;
            });
            return false;
        });
    }
    // Открывает диалог редактирования свойств
    function OpenEditDialog(_isNew, _Id, Name, Description, PublisherId, Price, PublishedAt, _parentForm) {
        if (_Id === void 0) { _Id = null; }
        if (Name === void 0) { Name = null; }
        if (Description === void 0) { Description = null; }
        if (PublisherId === void 0) { PublisherId = null; }
        if (Price === void 0) { Price = null; }
        if (PublishedAt === void 0) { PublishedAt = null; }
        parentForm = _parentForm;
        document.getElementById("dialog_book_divmsg").innerHTML = "";
        // Удалим ранее созданный диалог, чтобы очистить все свойства
        if (dlg.hasClass('ui-dialog-content')) {
            dlg.dialog('destroy');
        }
        SetRefInput("PublisherName", "PublisherId", dlg.find("div[name='fields']").eq(0), "Publishers/GetAutocompletePublishersList", true);
        if (!_isNew) {
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
                url: 'Authors/GetName',
                data: { 'Id': PublisherId },
                success: function (data) { PublisherName = data["name"]; }
            });
            dlg.find("input[name='PublisherName']").val(PublisherName);
        }
        else
            dlg.attr('title', 'Add new book');
        isNew = _isNew;
        // установим атрибут со значением ID чтобы обновить потом запись в БД
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
                    else
                        SetDialogActive(dlg, data);
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
        // validation form on client side
        var errors = "";
        if ($("#form_book input[name='Name']").val().length == 0) {
            errors = "The name of the book is empty";
        }
        var myDiv = document.getElementById("dialog_book_divmsg");
        if (errors.length != 0) {
            myDiv.innerHTML = errors;
            return;
        }
        else
            myDiv.innerHTML = "";
        // Здесь по атрибуту isNew, определяется что это новая запись или уже существующая
        // в зависимости от этого будет вызываться различный метод контроллера: Add или Update
        var action;
        if (isNew)
            action = 'Books/Create';
        else
            action = 'Books/Update?BookId=' + bookId;
        var msg = $('#form_book').serialize();
        $.ajax({
            type: 'POST',
            url: action,
            data: msg,
            success: function (data) {
                // Если запрос выполнен без ошибок то присваиваем полученный с сервера html код, элементу customers_table
                if (data["isOk"]) {
                    if (close) {
                        dlg.dialog('close');
                        $('#books_table_div').html(data["view"]);
                        $('#books_table_input').focus();
                        dlg.dialog('destroy');
                    }
                    else {
                        $('#books_table_div').html(data["view"]);
                        if (isNew) {
                            // Установим все поля ввода банковских счетов активными, поскольку контрагент уже записан в базу
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
            error: function (xhr, str) {
                var myDiv = document.getElementById("dialog_book_divmsg");
                myDiv.innerHTML = "Ошибка записи: " + xhr.responseCode;
            }
        });
    }
    function msg(str) {
        var myDiv = document.getElementById("dialog_book_divmsg");
        myDiv.innerHTML = str;
    }
    return {
        setters:[
            function (AuthorsChoiceDialog_1) {
                AuthorsChoiceDialog = AuthorsChoiceDialog_1;
            }],
        execute: function() {
            dlg = $("#dialog_book");
            saving = false;
            isNew = false;
            // Если  нажато сочетание ctrl+Enter тогда сохраняем данные и закрываем диалог
            dlg.keypress(function (e) {
                if (e.ctrlKey && e.keyCode == 10) {
                    e.preventDefault();
                    SaveChanges();
                }
            });
        }
    }
});
