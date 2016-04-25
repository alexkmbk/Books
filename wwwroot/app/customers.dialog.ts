///<reference path="../lib/jquery/jqueryui.d.ts" />
///<reference path="../lib/jquery/jquery.d.ts" />

import * as BanksChoiceDialog from "./banks_choice_dialog";

var autoComplete, input: JQuery;
var dlg: JQuery = $("#dialog_customer");
var saving: boolean = false;
var isNew: boolean = false;
var customerId: number;
var accountdialog_table: Table;
var parentForm: any;

function SetDialogActive(dlg: JQuery, data) {

    $('#bankaccounts_table_div :input').removeAttr('disabled');
    $('#bankaccounts_table_div').removeClass('disabled');
    isNew = false;
    dlg.dialog('option', 'title', "Контрагент " + $("#form_customer input[name='CustomerName']").val());

}

function InitDialog() {
    
    dlg.dialog({
        width: "60%",
        beforeClose: function (e: any, ui) {

            // если нажата клавиша ESC и выполняется редактирование ячейки,
            // то необходимо завершить редактирование не сохраняя введенные данные

            if (e.keyCode == 27) {
                if (accountdialog_table.inEditing) {
                    e.preventDefault();
                    accountdialog_table.EndEditing();
                    $("#bankaccounts_table_input").focus();
                }
            }
        }
    });

    var cols: Column[] = [new Column({ name: "BankAccountNumber", isVisible: true }),
        new Column({ name: "BankName", isVisible: true, isAutoComplete: true, AutoCompleteSource: "Customers/GetAutocompleteBankList", AutoCompleteID: "BankId", isChoiceForm: true }),
        new Column({ name: "BankId", isVisible: false }),
        new Column({ name: "BankAccountId", isVisible: false })];
    accountdialog_table = new Table("bankaccounts_table", true, cols, dlg, cols[3], 200);

    var panel = $("#bankaccounts_panel");
    panel.find("input[name='NewButton']").get(0).onclick = accountdialog_table.Add;
    panel.find("input[name='EditButton']").get(0).onclick = accountdialog_table.Edit;
    panel.find("input[name='DeleteButton']").get(0).onclick = accountdialog_table.BeforeDelete;

    $("#form_customer").get(0).onsubmit = SaveAndClose;

    //Удалить запись
    dlg.get(0).addEventListener("bankaccounts_table_BeforeDelete", function (e: any) {

        var rowdata: Array<any> = e.detail;
        $.ajax({
            type: 'POST',
            url: 'Customers/DeleteBankAccount',
            data: { BankAccountId: rowdata['BankAccountId'] },
            success: function (data) {
                if (data["isOk"]) {
                    accountdialog_table.Delete(); // удалить строку в диалоге
                }
                else {
                    var myDiv = document.getElementById("dialog_customer_divmsg");
                    myDiv.innerHTML = "Ошибка записи: " + data["Errors"];
                }
            },
            error: function (xhr, str) {
                var myDiv = document.getElementById("dialog_customer_divmsg");
                myDiv.innerHTML = "Ошибка записи: " + xhr.responseText;
            }
        });
    });

    dlg.get(0).addEventListener("bankaccounts_table_SaveTable", function (e: any) {

        var action;
        var rowdata;

        if (saving) return;

        saving = true;

        if (e.detail["BankAccountId"] == "") {
            action = 'Customers/AddBankAccount';
            rowdata = { BankAccountNumber: e.detail["BankAccountNumber"], BankId: e.detail["BankId"], CustomerId: customerId }
        }
        else {
            action = 'Customers/UpdateBankAccount';
            rowdata = { BankAccountNumber: e.detail["BankAccountNumber"], BankId: e.detail["BankId"], CustomerId: customerId, BankAccountId: e.detail["BankAccountId"] }
        }
        $.ajax({
            type: 'POST',
            url: action,
            data: rowdata,
            success: function (data) {
                if (data["isOk"]) {
                    accountdialog_table.EndEditing(data["BankAccountId"]);
                    saving = false;
                }
                else {
                    var myDiv = document.getElementById("dialog_customer_divmsg");
                    myDiv.innerHTML = "Ошибка записи: " + data["Errors"];
                    saving = false;
                }
            },
            error: function (xhr, str) {
                var myDiv = document.getElementById("dialog_customer_divmsg");
                myDiv.innerHTML = "Ошибка записи: " + xhr.responseText;
                saving = false;
            }
        });
    });

    accountdialog_table.elem.addEventListener("bankaccounts_table_ChoiceFormClick_BankName", function (e: any) {
        BanksChoiceDialog.OpenBanksChoiceDialog($("#dialog_Banks"), function (rowData: any) {
            accountdialog_table.SetInputValue("BankId", rowData["BankId"]);
            accountdialog_table.SetInputValue("BankName", rowData["BankName"]);
        },
            function () {
                accountdialog_table.choiceFormIsOpen = false;
        });
        return false;
    });



}

// Открывает диалог редактирования свойств
export function OpenEditDialog(_isNew: boolean, _CustomerId = null, CustomerName = null, BusinessTypeName = null, _parentForm: Window) {

    parentForm = _parentForm;

    document.getElementById("dialog_customer_divmsg").innerHTML = "";

    // Удалим ранее созданный диалог, чтобы очистить все свойства
    if (dlg.hasClass('ui-dialog-content')) {
        dlg.dialog('destroy');
    }

    if (!_isNew) {
        dlg.find("input[name='CustomerName']").val(CustomerName);
        dlg.find("input[name='CustomerId']").val(_CustomerId);
        dlg.find("select[name='BusinessTypeName']").val(BusinessTypeName);
        dlg.attr('title', 'Контрагент ' + CustomerName);
        customerId = _CustomerId;
    }
    else
        dlg.attr('title', 'Создание нового контрагента');
        
    // устанавливаем признак что запись уже существует, просто редактируем
    //dlg.attr('isNew', +_isNew);
    isNew = _isNew;
    // установим атрибут со значением ID чтобы обновить потом запись в БД

    $.ajax({
        type: 'GET',
        url: 'Customers/GetBankAccountsForEdit',
        data: { 'CustomerId': customerId },
        success: function (data) {
            // Если запрос выполнен без ошибок то присваиваем полученный с сервера html код, элементу BankAccountsTable
            if (data["isOk"]) {
                $('#bankaccounts_table_div').html(data["view"]);
                InitDialog();
                if (isNew) {
                    // Установим все поля ввода банковских счетов неактивными, поскольку контрагент еще не записан в базу
                    $('#bankaccounts_table_div :input').attr('disabled', "true");
                    $('#bankaccounts_table_div').addClass('disabled');
                }
                else SetDialogActive(dlg, data);

            }
            else {
                // Если запрос обработан, но произошла ошибка, то устанавливаем текст ошибки в элементе dialog_customer_divmsg
                //расположенном здесь, же на форме диалога, чтобы пользователь мог видеть сообщение
                var myDiv = document.getElementById("dialog_customer_divmsg");
                myDiv.innerHTML = "Ошибка полученния списка банковских счетов: " + data["Errors"];
            }
        },
        // если запрос не удалось обработать
        error: function (xhr, str) {
            var myDiv = document.getElementById("dialog_customer_divmsg");
            myDiv.innerHTML = "Ошибка полученния списка банковских счетов: " + xhr.responseText;
        }
    });

}




export function Save() {
    SaveChanges(false);
}

export function SaveAndClose() {
    SaveChanges(true);
}

// Save changes
function SaveChanges(close: boolean = false) {
    // validation form on client side
    var errors = "";
    if ($("#form_customer input[name='CustomerName']").val().length == 0) {
        errors = "Не задано имя контрагента";
    }

    var myDiv = document.getElementById("dialog_customer_divmsg");

    if (errors.length != 0) {
        myDiv.innerHTML = errors;
        return;
    }
    else
        myDiv.innerHTML = "";

    // Здесь по атрибуту isNew, определяется что это новая запись или уже существующая
    // в зависимости от этого будет вызываться различный метод контроллера: Add или Update
    var action: string;
    
    if (isNew) action = 'Customers/Add';
    else action = 'Customers/Update?CustomerId=' + customerId;

    var msg = $('#form_customer').serialize();
    $.ajax({
        type: 'POST',
        url: action,
        data: msg,
        success: function (data) {
            // Если запрос выполнен без ошибок то присваиваем полученный с сервера html код, элементу customers_table
            if (data["isOk"]) {
                if (close) {
                    dlg.dialog('close');                
                    $('#customers_table_div').html(data["view"]);
                    $('#customers_table_input').focus();
                    dlg.dialog('destroy');
                }
                else {
                    $('#customers_table_div').html(data["view"]);
                    if (isNew) {
                        // Установим все поля ввода банковских счетов активными, поскольку контрагент уже записан в базу
                        customerId = data["CustomerId"];
                        SetDialogActive(dlg, data);
                    }
                }
                var event = new CustomEvent("customers_table_AfterSave");
                parentForm.dispatchEvent(event);
            }
            else {
                //Если запрос обработан, но произошла ошибка, то устанавливаем текст ошибки в элементе dialog_customer_divmsg
                //расположенном здесь, же на форме диалога, чтобы пользователь мог видеть сообщение
                var myDiv = document.getElementById("dialog_customer_divmsg");
                myDiv.innerHTML = "Ошибка записи: " + data["Errors"];
            }
        },
        statusCode: {
            401: function (response) {
                document.location.hostname = "/Account/Login?returnUrl=/Customers/Index";
            }
        },
        // если запрос не удалось обработать
        error: function (xhr: any, str) {
            var myDiv = document.getElementById("dialog_customer_divmsg");
            myDiv.innerHTML = "Ошибка записи: " + xhr.responseCode;
        }
    });

}
  

function msg(str) {
    var myDiv = document.getElementById("dialog_customer_divmsg");
    myDiv.innerHTML = str;
}


// Обработка ввода с клавиатуры
// нажатие ENTER в поле CustomerName - переход на следующее поле
dlg.find("input[name='CustomerName']").keypress(function (e) {
    if (e.keyCode == $.ui.keyCode.ENTER) {
        e.preventDefault();
        $("#dialog_customer select[name='BusinessTypeName']").focus();
    }
});

// нажатие ENTER в поле BusinessTypeName - переход на кнопку submit
dlg.find("select[name='BusinessTypeName']").keypress(function (e) {
    if (e.keyCode == $.ui.keyCode.ENTER) {
        e.preventDefault();
        $("#dialog_customer input[type='submit']").focus();
    }
});

// Если  нажато сочетание ctrl+Enter тогда сохраняем данные и закрываем диалог
dlg.keypress(function (e) {
    if (e.ctrlKey && e.keyCode == 10) {
        e.preventDefault();
        SaveChanges();
    }
});

