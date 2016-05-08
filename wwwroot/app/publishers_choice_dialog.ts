///<reference path="../lib/jquery/jqueryui.d.ts" />
///<reference path="../lib/jquery/jquery.d.ts" />

var publishers_table: Table;

function PublisherChoiceForm_InitDialog(parent: JQuery, publishersdlg: JQuery, PickEventHandler: Function, CloseDialogHandler: Function) {

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

    var cols: Column[] = [new Column({ name: "Id", isVisible: false }),
        new Column({ name: "Name", isVisible: true })];
    publishers_table = new Table("publishers_table", false, cols, publishersdlg, cols[0], 200);

    publishersdlg.find("div[name='dialog_buttons_panel']").find("input[name='Choice']").get(0).onclick = publishers_table.Edit;

    //Выбор
    publishersdlg.get(0).addEventListener("publishers_table_Pick", function (e: any) {
        publishersdlg.dialog("close");
        PickEventHandler(e.detail);
        publishers_table = null;
    });
  
}

// Открывает диалог редактирования свойств
export function OpenPublishersChoiceDialog(parent: JQuery, PickEventHandler: Function, CloseDialogHandler: Function) {

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
                // Если запрос обработан, но произошла ошибка
            }
        },
        // если запрос не удалось обработать
        error: function (xhr, str) {
            
        }
    });

}
