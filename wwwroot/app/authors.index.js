System.register(["./books_choice_dialog"], function(exports_1) {
    var BooksChoiceDialog;
    var saving, authors_table;
    function InitAuthorsTableFilters() {
        var panel = $("#authors_panel");
        // При изменении полей отбора, перерисуем таблицу
        function filter() {
            $.ajax({
                type: 'GET',
                url: 'Authors/Index',
                data: {
                    BookId: panel.find("input[name = 'BookId']").val(),
                    ajax: "true"
                },
                success: function (data) {
                    if (data["isOk"]) {
                        $('#authors_table_div').html(data["view"]);
                        if (authors_table != undefined)
                            authors_table.removeEventListeners();
                        InitAuthorsTable();
                    }
                }
            });
        }
        SetRefInput("BookName", "BookId", panel.find("div[name = 'Book']"), "Books/GetAutocompleteList", true, filter, true);
        panel.find("div[name = 'Book']").get(0).addEventListener("BookName_ChoiceFormClick", function (e) {
            BooksChoiceDialog.OpenBooksChoiceDialog(panel.find("div[name = 'dialog_books_choice']"), function (rowData) {
                panel.find("input[name = 'BookName']").val(rowData["Name"]);
                panel.find("input[name = 'BookId']").val(rowData["Id"]);
                filter();
            }, function () {
                //accountdialog_table.choiceFormIsOpen = false;
            });
            return false;
        });
    }
    function InitAuthorsTable() {
        var cols = [new Column({ name: "Id", isVisible: false }),
            new Column({ name: "Name", isVisible: true })];
        authors_table = new Table("authors_table", true, cols, $(window), cols[0]);
        var panel = $("#authors_panel");
        panel.find("input[name='AddButton']").get(0).onclick = authors_table.Add;
        panel.find("input[name='EditButton']").get(0).onclick = authors_table.Edit;
        panel.find("input[name='DeleteButton']").get(0).onclick = authors_table.BeforeDelete;
    }
    return {
        setters:[
            function (BooksChoiceDialog_1) {
                BooksChoiceDialog = BooksChoiceDialog_1;
            }],
        execute: function() {
            InitAuthorsTable();
            InitAuthorsTableFilters();
            //Удалить запись
            window.addEventListener("authors_table_BeforeDelete", function (e) {
                var rowdata = e.detail;
                $.ajax({
                    type: 'POST',
                    url: 'authors/Delete',
                    data: { Id: rowdata['Id'] },
                    success: function (data) {
                        if (data["isOk"]) {
                            authors_table.Delete(); // удалить строку в диалоге
                        }
                        else {
                            var myDiv = document.getElementById("authors_divmsg");
                            myDiv.innerHTML = "Ошибка записи: " + data["Errors"];
                        }
                    },
                    error: function (xhr, str) {
                        var myDiv = document.getElementById("authors_divmsg");
                        myDiv.innerHTML = "Ошибка записи: " + xhr.responseText;
                    }
                });
            });
            window.addEventListener("authors_table_SaveTable", function (e) {
                var action;
                var rowdata;
                if (saving)
                    return;
                saving = true;
                if (e.detail["Id"] == "") {
                    action = 'Authors/Create';
                    rowdata = { Name: e.detail["Name"] };
                }
                else {
                    action = 'Authors/Update';
                    rowdata = { Name: e.detail["Name"], Id: e.detail["Id"] };
                }
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
                            var myDiv = document.getElementById("authors_divmsg");
                            myDiv.innerHTML = "Ошибка записи: " + data["Errors"];
                            saving = false;
                        }
                    },
                    error: function (xhr, str) {
                        var myDiv = document.getElementById("authors_divmsg");
                        myDiv.innerHTML = "Ошибка записи: " + xhr.responseText;
                        saving = false;
                    }
                });
            });
        }
    }
});
