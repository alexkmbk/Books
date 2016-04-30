System.register(["./books_choice_dialog"], function(exports_1) {
    var BooksChoiceDialog;
    var saving, publishers_table;
    function InitPublishersTable() {
        var cols = [new Column({ name: "Id", isVisible: false }),
            new Column({ name: "Name", isVisible: true })];
        var publishers_table = new Table("publishers_table", true, cols, $(window), cols[0]);
        var panel = $("#publishers_panel");
        panel.find("input[name='AddButton']").get(0).onclick = publishers_table.Add;
        panel.find("input[name='EditButton']").get(0).onclick = publishers_table.Edit;
        panel.find("input[name='DeleteButton']").get(0).onclick = publishers_table.BeforeDelete;
        // При изменении полей отбора, перерисуем таблицу
        function filter() {
            $.ajax({
                type: 'GET',
                url: 'Publishers/Index',
                data: {
                    BookId: panel.find("input[name = 'BookId']").val(),
                    ajax: "true"
                },
                success: function (data) {
                    if (data["isOk"]) {
                        $('#publishers_table_div').html(data["view"]);
                        InitPublishersTable();
                    }
                }
            });
        }
        SetRefInput("BookName", "BookId", panel.find("div[name = 'Book']"), "Books/GetAutocompleteList", true, filter);
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
    return {
        setters:[
            function (BooksChoiceDialog_1) {
                BooksChoiceDialog = BooksChoiceDialog_1;
            }],
        execute: function() {
            InitPublishersTable();
            //Удалить запись
            window.addEventListener("publishers_table_BeforeDelete", function (e) {
                var rowdata = e.detail;
                $.ajax({
                    type: 'POST',
                    url: 'Publishers/Delete',
                    data: { Id: rowdata['Id'] },
                    success: function (data) {
                        if (data["isOk"]) {
                            publishers_table.Delete(); // удалить строку в диалоге
                        }
                        else {
                            var myDiv = document.getElementById("publishers_divmsg");
                            myDiv.innerHTML = "Ошибка записи: " + data["Errors"];
                        }
                    },
                    error: function (xhr, str) {
                        var myDiv = document.getElementById("publishers_divmsg");
                        myDiv.innerHTML = "Ошибка записи: " + xhr.responseText;
                    }
                });
            });
            window.addEventListener("publishers_table_SaveTable", function (e) {
                var action;
                var rowdata;
                if (saving)
                    return;
                saving = true;
                if (e.detail["Id"] == "") {
                    action = 'Publishers/Create';
                    rowdata = { Name: e.detail["Name"] };
                }
                else {
                    action = 'Publishers/Update';
                    rowdata = { Name: e.detail["Name"], Id: e.detail["Id"] };
                }
                $.ajax({
                    type: 'POST',
                    url: action,
                    data: rowdata,
                    success: function (data) {
                        if (data["isOk"]) {
                            publishers_table.EndEditing(data["Id"]);
                            saving = false;
                        }
                        else {
                            var myDiv = document.getElementById("publishers_divmsg");
                            myDiv.innerHTML = "Ошибка записи: " + data["Errors"];
                            saving = false;
                        }
                    },
                    error: function (xhr, str) {
                        var myDiv = document.getElementById("publishers_divmsg");
                        myDiv.innerHTML = "Ошибка записи: " + xhr.responseText;
                        saving = false;
                    }
                });
            });
        }
    }
});