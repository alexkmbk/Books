///<reference path="../lib/jquery/jqueryui.d.ts" />
///<reference path="../lib/jquery/jquery.d.ts" />
System.register([], function(exports_1) {
    var authors_choicetable;
    function AuthorChoiceForm_InitDialog(parent, authorsdlg, PickEventHandler, CloseDialogHandler) {
        authorsdlg.attr('title', 'Authors choice');
        authorsdlg.dialog({
            modal: true,
            width: "50%",
            position: { my: "bottom", at: "bottom", of: window },
            open: function (event, ui) {
                $(this).parent().css('position', 'fixed');
            },
            close: function () {
                CloseDialogHandler();
                $(this).dialog('destroy').remove();
                authorsdlg = undefined;
            }
        });
        var cols = [new Column({ name: "Id", isVisible: false }),
            new Column({ name: "Name", isVisible: true })];
        authors_choicetable = new Table("authors_choicetable", false, cols, authorsdlg, cols[0], 200);
        authorsdlg.find("div[name='dialog_buttons_panel']").find("input[name='Choice']").get(0).onclick = authors_choicetable.Edit;
        //Выбор
        authorsdlg.get(0).addEventListener("authors_choicetable_Pick", function (e) {
            authorsdlg.dialog("close");
            PickEventHandler(e.detail);
            authors_choicetable = null;
        });
    }
    // Открывает диалог редактирования свойств
    function OpenAuthorsChoiceDialog(parent, PickEventHandler, CloseDialogHandler) {
        var authorsdlg = $("#dialog_authors_choiceform");
        if (authorsdlg) {
            // Удалим ранее созданный диалог, чтобы очистить все свойства
            if (authorsdlg.hasClass('ui-dialog-content')) {
                authorsdlg.dialog('destroy').remove();
            }
        }
        $.ajax({
            type: 'GET',
            url: 'Authors/GetChoiceForm',
            success: function (data) {
                if (data["isOk"]) {
                    parent.html(data["view"]);
                    AuthorChoiceForm_InitDialog(parent, $("#dialog_authors_choiceform"), PickEventHandler, CloseDialogHandler);
                }
                else {
                }
            },
            // если запрос не удалось обработать
            error: function (xhr, str) {
            }
        });
    }
    exports_1("OpenAuthorsChoiceDialog", OpenAuthorsChoiceDialog);
    function msg(str) {
        var myDiv = document.getElementById("dialog_authors_choiceform_divmsg");
        myDiv.innerHTML = str;
    }
    return {
        setters:[],
        execute: function() {
        }
    }
});
