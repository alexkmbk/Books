///<reference path="../lib/jquery/jqueryui.d.ts" />
///<reference path="../lib/jquery/jquery.d.ts" />
System.register([], function(exports_1) {
    var publishers_table;
    function PublisherChoiceForm_InitDialog(parent, publishersdlg, PickEventHandler, CloseDialogHandler) {
        publishersdlg.attr('title', 'Publishers choice');
        publishersdlg.dialog({
            modal: true,
            width: "50%",
            open: function (event, ui) {
                $(this).parent().css('position', 'fixed');
            },
            close: function () {
                CloseDialogHandler();
                $(this).dialog('destroy').remove();
                publishersdlg = undefined;
            }
        });
        var cols = [new Column({ name: "Id", isVisible: false }),
            new Column({ name: "Name", isVisible: true })];
        publishers_table = new Table("publishers_table", false, cols, publishersdlg, cols[0], 200);
        publishersdlg.find("div[name='dialog_buttons_panel']").find("input[name='Choice']").get(0).onclick = publishers_table.Edit;
        //Выбор
        publishersdlg.get(0).addEventListener("publishers_table_Pick", function (e) {
            publishersdlg.dialog("close");
            PickEventHandler(e.detail);
            publishers_table = null;
        });
    }
    // Открывает диалог редактирования свойств
    function OpenPublishersChoiceDialog(parent, PickEventHandler, CloseDialogHandler) {
        var publishersdlg = $("#dialog_publishers_choiceform");
        if (publishersdlg) {
            // Удалим ранее созданный диалог, чтобы очистить все свойства
            if (publishersdlg.hasClass('ui-dialog-content')) {
                publishersdlg.dialog('destroy').remove();
            }
        }
        $.ajax({
            type: 'GET',
            url: 'Publishers/GetChoiceForm',
            success: function (data) {
                // Если запрос выполнен без ошибок то присваиваем полученный с сервера html код
                if (data["isOk"]) {
                    parent.html(data["view"]);
                    PublisherChoiceForm_InitDialog(parent, $("#dialog_publishers_choiceform"), PickEventHandler, CloseDialogHandler);
                }
                else {
                }
            },
            // если запрос не удалось обработать
            error: function (xhr, str) {
            }
        });
    }
    exports_1("OpenPublishersChoiceDialog", OpenPublishersChoiceDialog);
    function msg(str) {
        var myDiv = document.getElementById("dialog_publishers_choiceform_divmsg");
        myDiv.innerHTML = str;
    }
    return {
        setters:[],
        execute: function() {
        }
    }
});
