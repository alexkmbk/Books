///<reference path="../lib/jquery/jqueryui.d.ts" />
///<reference path="../lib/jquery/jquery.d.ts" />
System.register([], function(exports_1) {
    var books_choicetable;
    function BookChoiceForm_InitDialog(parent, booksdlg, PickEventHandler, CloseDialogHandler) {
        booksdlg.attr('title', 'books choice');
        booksdlg.dialog({
            modal: true,
            width: "50%",
            open: function (event, ui) {
                $(this).parent().css('position', 'fixed');
            },
            close: function () {
                CloseDialogHandler();
                $(this).dialog('destroy').remove();
                booksdlg = undefined;
            }
        });
        var cols = [new Column({ name: "Id", isVisible: false }),
            new Column({ name: "Name", isVisible: true }),
            new Column({ name: "Authors", isVisible: true })];
        books_choicetable = new Table("books_choicetable", false, cols, booksdlg, cols[0], 200);
        booksdlg.find("div[name='dialog_buttons_panel']").find("input[name='Choice']").get(0).onclick = books_choicetable.Edit;
        //Выбор
        booksdlg.get(0).addEventListener("books_choicetable_Pick", function (e) {
            booksdlg.dialog("close");
            PickEventHandler(e.detail);
            books_choicetable = null;
        });
    }
    // Открывает диалог редактирования свойств
    function OpenBooksChoiceDialog(parent, PickEventHandler, CloseDialogHandler) {
        var booksdlg = $("#dialog_books_choiceform");
        if (booksdlg) {
            // Удалим ранее созданный диалог, чтобы очистить все свойства
            if (booksdlg.hasClass('ui-dialog-content')) {
                booksdlg.dialog('destroy').remove();
            }
        }
        $.ajax({
            type: 'GET',
            url: 'Books/GetChoiceForm',
            success: function (data) {
                if (data["isOk"]) {
                    parent.html(data["view"]);
                    BookChoiceForm_InitDialog(parent, $("#dialog_books_choiceform"), PickEventHandler, CloseDialogHandler);
                }
                else {
                }
            },
            // если запрос не удалось обработать
            error: function (xhr, str) {
            }
        });
    }
    exports_1("OpenBooksChoiceDialog", OpenBooksChoiceDialog);
    return {
        setters:[],
        execute: function() {
        }
    }
});
