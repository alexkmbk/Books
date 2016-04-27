// Данный модуль загружается глобально и всегда находится в памяти

///<reference path="../lib/jquery/jquery.d.ts" />
///<reference path="./keyboard_code_enums.ts"/>

interface ColumnOptions {
    name: string;
    isVisible: boolean;
    isAutoComplete?: boolean;
    AutoCompleteSource?: string;
    AutoCompleteID?: string;
    isChoiceForm?: boolean;
}

function SetAutoComplete(input: JQuery, col: Column, table: Table) {
    //var parentForm = this.parentForm;

    input.autocomplete({
        source: col.AutoCompleteSource,
        minLength: 1,
        select: function (event, ui) {
            ui.item ?
                $("#" + col.AutoCompleteID + "_input").val(ui.item.Id) :
                $("#" + col.AutoCompleteID + "_input").val("");
        },
        open: function () {
            var z = window.document.defaultView.getComputedStyle(table.parentForm.get(0)).getPropertyValue('z-index');
            table.autoComplete.zIndex(10 + (+z));
        },
    });
    table.autoComplete = input.autocomplete("widget");
    table.autoComplete.insertAfter(table.parentForm);
}

class Column {
    name: string;
    isVisible: boolean;
    isAutoComplete: boolean;
    AutoCompleteSource: string;
    AutoCompleteID: string;
    isChoiceForm: boolean;
    constructor(options: ColumnOptions) {
        if (options) {
            this.name = options.name;
            this.isVisible = options.isVisible;
            this.isAutoComplete = options.isAutoComplete; 
            this.AutoCompleteSource = options.AutoCompleteSource;
            this.AutoCompleteID = options.AutoCompleteID;
            this.isChoiceForm = options.isChoiceForm;
        }
    }

}

class Table {
    name: string;
    isEditable: boolean;
    columns: Column[];
    idSelector: string;
    obj: JQuery;
    public elem: HTMLElement;
    public inEditing: boolean;
    dontEndEditing: boolean = false;
    autoComplete: JQuery;
    public parentForm: JQuery;
    public choiceFormIsOpen: boolean;
    IdColumn: Column;

    constructor(name: string, isEditable: boolean, columns: Column[] = null, parentForm: JQuery = null, IdColumn: Column = null, height?: number) {


        this.name = name;
        this.isEditable = isEditable;
        this.columns = columns;
        this.idSelector = '#' + name;
        this.obj = $(this.idSelector);
        this.elem = this.obj.get(0);
        this.inEditing = false;
        this.parentForm = parentForm;
        this.IdColumn = IdColumn;

        this.obj.height(height);
        this.choiceFormIsOpen = false;

        var parent: JQuery = $(this.elem.parentNode);

        parent.on('keydown', this.idSelector + '_input', this.Keydown);
        parent.on('click', this.idSelector + ' > tbody', this.Click);
        parent.on('click', this.idSelector + ' > tbody > tr', this.ClickOnRow);
        parent.on('dblclick', this.idSelector + ' > tbody > tr > td', this.DblClickOnRow);
        parent.on('keydown', '.tableinput', this.InputKeydown);

        $(document).on('click', this.DocClick);

        //Выделим первую строку
        this.obj.find('tbody > tr').first().addClass('highlight');
      }

    public SetInputValue(ColName: string, value: any) {
        this.obj.find('#' + ColName + '_input').val(value);
    }

    public BeforeDelete = () => {
        var rowData = new Array();
        var columns = this.columns;
        if (this.inEditing) {
            this.obj.find('.tableinput').each(function (index, value) {
                rowData[columns[index].name] = $(this).val();
            });
        }
        else {
            this.obj.find('.highlight > td').each(function (index, value) {
                rowData[columns[index].name] = $(this).html();
            });
        }
        var event = new CustomEvent(this.name + "_BeforeDelete", { 'detail': rowData });
        this.parentForm.get(0).dispatchEvent(event);
    };

    public Delete() {
        this.obj.find('.highlight > td').remove();
        this.obj.find('tbody > tr').first().addClass('highlight');
}


    public Edit = () => {
        if (this.inEditing) {
            this.obj.find(".tableinput").first().focus();
            return;
        }
        this.EditCell(null);
        this.dontEndEditing = true;
        return false;
    }


    public EditCell = (_row: JQuery = null, currentcell: JQuery = null, isNew: boolean = false) => {
         var rowData = new Array();
        var columns = this.columns;
        var isEditable = this.isEditable;
        var row: JQuery;
        if (_row == null)
            row = this.obj.find(' .highlight');
        else row = _row;
        var table = this;

        if (columns) {

            row.find("td").each(function (index, value) {
                var cell = $(this);
                var val;
                var input: JQuery;
                val = cell.html();
                var col: Column = columns[index];
                if (isEditable) {
                    // Обработка непонятной ситуации, когда, почему-то 
                    // остается не удаленным элемент редактирования
                    if (cell.find("input").length != 0) {
                        input = cell.find("input");
                        val = input.val();
                        if (col.isAutoComplete) {
                            $(this).autocomplete("destroy");
                            $(this).removeData('autocomplete');
                        }
                        input.remove();
                        cell.html("");
                    }
                }
                rowData[col.name] = val;

                if (isEditable) {
                    input = $(document.createElement('input'));
                    input.attr("id", col.name + "_input");
                    input.attr("value", val);
                    input.attr("prevVal", val);
                    input.attr("type", col.isVisible ? "text" : "hidden");

                    input.addClass("tableinput");
                    cell.html("");
                    cell.append(input);

                    // Если есть форма выбора, добавим кнопку собработчиком нажатия
                    if (col.isChoiceForm) {
                        var colName = col.name;
                        var button = $(document.createElement('input'));
                        button.attr("type", "button");
                        //button.css("margin-left", -30);
                        //button.css("margin-top", 3);
                        button.val("...");
                        button.addClass("ChoiceFormButton");
                        var height = 25;//input.height();
                        button.width(height);
                        button.height(height);
                        button.on("click", function (e: MouseEvent) {
                            e.preventDefault();
                            table.choiceFormIsOpen = true;
                            var event = new CustomEvent(table.name + "_ChoiceFormClick_" + col.name);
                            table.elem.dispatchEvent(event);
                            return false;
                        });
                        cell.append(button);
                    }

                    cell.parent().attr("isNew", isNew?"true":"false");
                    if (col.isAutoComplete) {
                        SetAutoComplete(input, col, table);
                    }
                }
            });
        }
        if (isEditable) {
            if (currentcell == null) {
                row.find("input").first().focus();
            }
            else {
                currentcell.find("input").first().focus();
            }
            this.inEditing = true;
        }
        if (!isNew) {
            var event = new CustomEvent(this.name + "_Pick", { 'detail': rowData });
            this.parentForm.get(0).dispatchEvent(event);
        }
    }

    public WasChanged = () => {
        var res: boolean = false;
        this.obj.find(".tableinput").each(function (index, value) {
            if ($(this).attr("prevVal") != $(this).val()) {
                res = true;
            }
        });
        return res;
    }

    public Add = (e?: any) => {

        if (this.inEditing) {
            this.obj.find(".tableinput").first().focus();
            return;
        }

        this.dontEndEditing = true;

        // Удалим пустую строку в пустой таблице
        $('.EmptyTable tr:last').first().remove();
        $('.EmptyTable').removeClass("EmptyTable");

        var emptyRowStr = "<tr>";
        for (var i = 0; i < this.columns.length; i++) {
            emptyRowStr = emptyRowStr + (this.columns[i].isVisible ? "<td></td>" : "<td style='display:none;'></td>");
        }
        emptyRowStr = emptyRowStr + "</tr>";

        this.obj.find('tr:last').first().after(emptyRowStr);
        this.EditCell(this.obj.find('tr:last').first(),null,true);

        var event = new CustomEvent(this.name + "_New");
        this.parentForm.get(0).dispatchEvent(event);
    }

    public EndEditing = (ColIdValue?) => {
        this.inEditing = false;

        var inputs = this.obj.find(".tableinput");
        var row = inputs.eq(0).parent().parent();
        if (!this.WasChanged() && (row.attr("isNew") == "true")) {
            row.remove();
            return;
        }

        var columns = this.columns;
        if (ColIdValue) $("#" + this.IdColumn.name + "_input").val(ColIdValue);
        inputs.each(function (index, value) {
            var td = $(this).parent();
            var val = $(this).val();

            if (columns[index].isAutoComplete) {
                $(this).autocomplete("destroy");
                $(this).removeData('autocomplete');
            }

            $(this).remove();
            td.html(val);
        });
        row.attr("isNew", "false");
        row.addClass('highlight');
    }

    // Обработка ввода с клавиатуры 

    InputKeydown = (e: any) => {

        // вход в режим редактирования ячейки при нажатии клавише ENTER
        if (e.keyCode == keyCodes.ENTER) {
            e.preventDefault();
            var input: JQuery = $((<Element>e.target));
            var td = input.parent();
            
            if (td.parent().children().index(td) < td.parent().find("input[type!='hidden'][type!='button']").length - 1) {
                td.next('td').find("input[type!='button']").first().focus();
            }
            else {
                var row = input.parent().parent();
                var rowData = new Array();
                var columns = this.columns;
                td.parent().find("input[type!='button']").each(function (index, value) {
                    //rowdata[index] = $(this).val();
                    rowData[columns[index].name] = $(this).val();
                });
                var event = new CustomEvent(this.name + "_SaveTable", { 'detail': rowData });
                this.parentForm.get(0).dispatchEvent(event);
                $(this.idSelector + "_input").focus();
            }
        }
    }

    // Если нажали клавишу внутри таблицы
    Keydown = (e: KeyboardEvent) => {
        // перемещение фокуса строки на одну строку вниз
        if (e.keyCode == keyCodes.DOWN_ARROW) {
            e.preventDefault();
            this.obj.find('.highlight').next().addClass('highlight').siblings().removeClass('highlight');
        }

        // перемещение фокуса строки на одну строку вверх
        else if (e.keyCode == keyCodes.UP_ARROW) {
            e.preventDefault();
            this.obj.find('.highlight').prev().addClass('highlight').siblings().removeClass('highlight');
        }
  
        // INSERT
        else if (e.keyCode == keyCodes.INSERT) {
            e.preventDefault();
            this.Add();
        }

        // DELETE
        else if (e.keyCode == keyCodes.DELETE) {
            e.preventDefault();
            this.BeforeDelete();
        }

        else if (e.keyCode == keyCodes.ENTER) {
            e.preventDefault();
            this.Edit();
        }
    };

    DocClick = (e:any) => {

        if (this.choiceFormIsOpen||e.target.classList.contains("ChoiceFormButton")){
            return;
        }

        if (this.dontEndEditing) {
            this.dontEndEditing = false;
            return;
        }

        if (this.inEditing && (!(e.target.classList.contains("tableinput")))) {
            if (this.WasChanged()) {
                e.preventDefault();
                var inputs = this.obj.find("input[type!='button']");
                var rowData = new Array();
                var columns = this.columns;
                inputs.each(function (index, value) {
                    rowData[columns[index].name] = $(this).val();
                });
                var event = new CustomEvent(this.name + "_SaveTable", { 'detail': rowData });
                this.parentForm.get(0).dispatchEvent(event);
                $(this.idSelector + "_input").focus();
            }
            else {
                e.preventDefault();
                this.EndEditing(undefined);
                return false;
            }
        } 
    }

    // Устанавливаем фокус на таблицу если щелкнули мышкой внутри таблицы
    Click = (e: any) => {

        if (e.target.classList.contains("ChoiceFormButton")) {
            return;
        }
        if ((e.target.id == this.name || $(e.target).parents().length) && ($(e.target).prop("tagName").toLowerCase() != "input")) {
            $(this.idSelector + '_input').focus();
            }
    };

    // подсвечивание строки
    ClickOnRow = (e: any) => {

        if (e.target.classList.contains("ChoiceFormButton")) {
            return;
        }

        var target: JQuery = $(e.target);
        var tagName = target.prop("tagName").toLowerCase();
        var targetRow;
        if (tagName == "input")
            targetRow = target.parent().parent();
        else
            targetRow = target.parent();

        targetRow.addClass('highlight').siblings().removeClass('highlight');

        if (this.isEditable) {
            // Попытка захватить фокус если редактируется строка (нужны еще доработки)
            if ((this.inEditing) && (e.target.className.indexOf("tableinput") == -1)) {
                e.preventDefault();
                //$(":focus").focus();
                this.obj.find(".tableinput").first().focus();
            }
            /*else if (e.target.id == this.name || target.parents(this.idSelector).length) {
                if (e.target.className.indexOf("tableinput") == -1) {
                    $(this.idSelector + "_input").focus();
                }

            }*/
        }

    };

    // двойной клик по ячейке таблицы, проиходсит вход в режим редактирования
    DblClickOnRow = (e: MouseEvent) => {
        e.preventDefault();
        this.Edit();
    };
}