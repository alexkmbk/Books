///<reference path="../lib/jquery/jqueryui.d.ts" />
///<reference path="../lib/jquery/jquery.d.ts" />

var books_choicetable: Table;

function BookChoiceForm_InitDialog(parent: JQuery, booksdlg: JQuery, PickEventHandler: Function, CloseDialogHandler: Function) {

    booksdlg.attr('title', 'books choice');
    booksdlg.dialog({
        modal: true,
        width: "50%",
        position: { my: "bottom", at: "bottom", of: window },
        open: function (event, ui) {
            $(this).parent().css('position', 'fixed');
        },
        close: function () {
            CloseDialogHandler();
            $(this).dialog('destroy').remove();
            booksdlg = undefined;
        }
    });

    var cols: Column[] = [new Column({ name: "Id", isVisible: false }),
        new Column({ name: "Name", isVisible: true }),
        new Column({ name: "Authors", isVisible: true })];
    books_choicetable = new Table("books_choicetable", false, cols, booksdlg, cols[0], 200);

    booksdlg.find("div[name='dialog_buttons_panel']").find("input[name='Choice']").get(0).onclick = books_choicetable.Edit;

    //Выбор
    booksdlg.get(0).addEventListener("books_choicetable_Pick", function (e: any) {
        booksdlg.dialog("close");
        PickEventHandler(e.detail);
        books_choicetable = null;
    });
  
}

// Открывает диалог редактирования свойств
export function OpenBooksChoiceDialog(parent: JQuery, PickEventHandler: Function, CloseDialogHandler: Function) {

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
                // Если запрос обработан, но произошла ошибка
            }
        },
        // если запрос не удалось обработать
        error: function (xhr, str) {
            
        }
    });

}

function msg(str) {
    var myDiv = document.getElementById("dialog_books_choicetableform_divmsg");
    myDiv.innerHTML = str;
}
