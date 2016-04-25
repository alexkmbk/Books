///<reference path="../lib/jquery/jqueryui.d.ts" />
///<reference path="../lib/jquery/jquery.d.ts" />
System.register([], function(exports_1) {
    var banks_table;
    function BankChoiceForm_InitDialog(parent, banksdlg, PickEventHandler, CloseDialogHandler) {
        banksdlg.attr('title', 'Выбор банка');
        banksdlg.dialog({
            modal: true,
            width: "50%",
            position: { my: "bottom", at: "bottom", of: window },
            open: function (event, ui) {
                $(this).parent().css('position', 'fixed');
            },
            close: function () { CloseDialogHandler(); }
        });
        var cols = [new Column({ name: "BankBIC", isVisible: true }),
            new Column({ name: "BankName", isVisible: true }),
            new Column({ name: "BankId", isVisible: false }),
            new Column({ name: "BankAccountId", isVisible: false })];
        banks_table = new Table("banks_table", false, cols, banksdlg, cols[3], 200);
        $("#banks_panel").find("input[name='Choice']").get(0).onclick = banks_table.Edit;
        //Выбор
        banksdlg.get(0).addEventListener("banks_table_Pick", function (e) {
            banksdlg.dialog("close");
            banksdlg.dialog("destroy");
            PickEventHandler(e.detail);
            banks_table = null;
        });
    }
    // Открывает диалог редактирования свойств
    function OpenBanksChoiceDialog(parent, PickEventHandler, CloseDialogHandler) {
        var banksdlg = $("#dialog_banks_choiceform");
        if (banksdlg) {
            // Удалим ранее созданный диалог, чтобы очистить все свойства
            if (banksdlg.hasClass('ui-dialog-content')) {
                banksdlg.dialog('destroy');
            }
        }
        $.ajax({
            type: 'GET',
            url: 'Customers/GetBanksChoiceForm',
            success: function (data) {
                // Если запрос выполнен без ошибок то присваиваем полученный с сервера html код, элементу BankAccountsTable
                if (data["isOk"]) {
                    parent.html(data["view"]);
                    BankChoiceForm_InitDialog(parent, $("#dialog_banks_choiceform"), PickEventHandler, CloseDialogHandler);
                }
                else {
                }
            },
            // если запрос не удалось обработать
            error: function (xhr, str) {
            }
        });
    }
    exports_1("OpenBanksChoiceDialog", OpenBanksChoiceDialog);
    function msg(str) {
        var myDiv = document.getElementById("dialog_banks_choiceform_divmsg");
        myDiv.innerHTML = str;
    }
    return {
        setters:[],
        execute: function() {
        }
    }
});
