// Данный модуль загружается глобально и всегда находится в памяти
///<reference path="../lib/jquery/jquery.d.ts" />
///<reference path="./keyboard_code_enums.ts"/>
function SetAutoComplete(input, col, table) {
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
var Column = (function () {
    function Column(options) {
        if (options) {
            this.name = options.name;
            this.isVisible = options.isVisible;
            this.isAutoComplete = options.isAutoComplete;
            this.AutoCompleteSource = options.AutoCompleteSource;
            this.AutoCompleteID = options.AutoCompleteID;
            this.isChoiceForm = options.isChoiceForm;
        }
    }
    return Column;
})();
var Table = (function () {
    function Table(name, isEditable, columns, parentForm, IdColumn, height) {
        var _this = this;
        if (columns === void 0) { columns = null; }
        if (parentForm === void 0) { parentForm = null; }
        if (IdColumn === void 0) { IdColumn = null; }
        this.dontEndEditing = false;
        this.BeforeDelete = function () {
            var rowData = new Array();
            var columns = _this.columns;
            if (_this.inEditing) {
                _this.obj.find('.tableinput').each(function (index, value) {
                    rowData[columns[index].name] = $(this).val();
                });
            }
            else {
                _this.obj.find('.highlight > td').each(function (index, value) {
                    rowData[columns[index].name] = $(this).html();
                });
            }
            var event = new CustomEvent(_this.name + "_BeforeDelete", { 'detail': rowData });
            _this.parentForm.get(0).dispatchEvent(event);
        };
        this.Edit = function () {
            if (_this.inEditing) {
                _this.obj.find(".tableinput").first().focus();
                return;
            }
            _this.EditCell(null);
            _this.dontEndEditing = true;
            return false;
        };
        this.EditCell = function (_row, currentcell, isNew) {
            if (_row === void 0) { _row = null; }
            if (currentcell === void 0) { currentcell = null; }
            if (isNew === void 0) { isNew = false; }
            var rowData = new Array();
            var columns = _this.columns;
            var isEditable = _this.isEditable;
            var row;
            if (_row == null)
                row = _this.obj.find(' .highlight');
            else
                row = _row;
            var table = _this;
            if (columns) {
                row.find("td").each(function (index, value) {
                    var cell = $(this);
                    var val;
                    var input;
                    val = cell.html();
                    var col = columns[index];
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
                            var height = 25; //input.height();
                            button.width(height);
                            button.height(height);
                            button.on("click", function (e) {
                                e.preventDefault();
                                table.choiceFormIsOpen = true;
                                var event = new CustomEvent(table.name + "_ChoiceFormClick_" + col.name);
                                table.elem.dispatchEvent(event);
                                return false;
                            });
                            cell.append(button);
                        }
                        cell.parent().attr("isNew", isNew ? "true" : "false");
                        if (col.isAutoComplete) {
                            SetAutoComplete(input, col, table);
                        }
                    }
                });
            }
            if (isEditable) {
                if (currentcell == null) {
                    row.find(".tableinput").first().focus();
                }
                else {
                    currentcell.find(".tableinput").first().focus();
                }
                _this.inEditing = true;
            }
            if (!isNew) {
                var event = new CustomEvent(_this.name + "_Pick", { 'detail': rowData });
                _this.parentForm.get(0).dispatchEvent(event);
            }
        };
        this.WasChanged = function () {
            var res = false;
            _this.obj.find(".tableinput").each(function (index, value) {
                if ($(this).attr("prevVal") != $(this).val()) {
                    res = true;
                }
            });
            return res;
        };
        this.Add = function (e) {
            if (_this.inEditing) {
                _this.obj.find(".tableinput").first().focus();
                return;
            }
            _this.dontEndEditing = true;
            // Удалим пустую строку в пустой таблице
            $('.EmptyTable tr:last').first().remove();
            $('.EmptyTable').removeClass("EmptyTable");
            var emptyRowStr = "<tr>";
            for (var i = 0; i < _this.columns.length; i++) {
                emptyRowStr = emptyRowStr + (_this.columns[i].isVisible ? "<td></td>" : "<td style='display:none;'></td>");
            }
            emptyRowStr = emptyRowStr + "</tr>";
            _this.obj.find('tr:last').first().after(emptyRowStr);
            _this.EditCell(_this.obj.find('tr:last').first(), null, true);
            var event = new CustomEvent(_this.name + "_New");
            _this.parentForm.get(0).dispatchEvent(event);
        };
        this.EndEditing = function (ColIdValue) {
            _this.inEditing = false;
            var inputs = _this.obj.find(".tableinput");
            var row = inputs.eq(0).parent().parent();
            if (!_this.WasChanged() && (row.attr("isNew") == "true")) {
                row.remove();
                return;
            }
            var columns = _this.columns;
            if (ColIdValue)
                $("#" + _this.IdColumn.name + "_input").val(ColIdValue);
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
            row.siblings().removeClass('highlight');
        };
        // Обработка ввода с клавиатуры 
        this.InputKeydown = function (e) {
            // вход в режим редактирования ячейки при нажатии клавише ENTER
            if (e.keyCode == keyCodes.ENTER) {
                e.preventDefault();
                var input = $(e.target);
                var td = input.parent();
                if (td.parent().children().index(td) < td.parent().find("input[type!='hidden'][type!='button']").length - 1) {
                    td.next('td').find("input[type!='button']").first().focus();
                }
                else {
                    var row = input.parent().parent();
                    var rowData = new Array();
                    var columns = _this.columns;
                    td.parent().find("input[type!='button']").each(function (index, value) {
                        //rowdata[index] = $(this).val();
                        rowData[columns[index].name] = $(this).val();
                    });
                    var event = new CustomEvent(_this.name + "_SaveTable", { 'detail': rowData });
                    _this.parentForm.get(0).dispatchEvent(event);
                    $(_this.idSelector + "_input").focus();
                }
            }
        };
        // Если нажали клавишу внутри таблицы
        this.Keydown = function (e) {
            // перемещение фокуса строки на одну строку вниз
            if (e.keyCode == keyCodes.DOWN_ARROW) {
                e.preventDefault();
                _this.obj.find('.highlight').next().addClass('highlight').siblings().removeClass('highlight');
            }
            else if (e.keyCode == keyCodes.UP_ARROW) {
                e.preventDefault();
                _this.obj.find('.highlight').prev().addClass('highlight').siblings().removeClass('highlight');
            }
            else if (e.keyCode == keyCodes.INSERT) {
                e.preventDefault();
                _this.Add();
            }
            else if (e.keyCode == keyCodes.DELETE) {
                e.preventDefault();
                _this.BeforeDelete();
            }
            else if (e.keyCode == keyCodes.ENTER) {
                e.preventDefault();
                _this.Edit();
            }
        };
        this.DocClick = function (e) {
            if (_this.choiceFormIsOpen || e.target.classList.contains("ChoiceFormButton")) {
                return;
            }
            if (_this.dontEndEditing) {
                _this.dontEndEditing = false;
                return;
            }
            if (_this.inEditing && (!(e.target.classList.contains("tableinput")))) {
                if (_this.WasChanged()) {
                    e.preventDefault();
                    var inputs = _this.obj.find("input[type!='button']");
                    var rowData = new Array();
                    var columns = _this.columns;
                    inputs.each(function (index, value) {
                        rowData[columns[index].name] = $(this).val();
                    });
                    var event = new CustomEvent(_this.name + "_SaveTable", { 'detail': rowData });
                    _this.parentForm.get(0).dispatchEvent(event);
                    $(_this.idSelector + "_input").focus();
                }
                else {
                    e.preventDefault();
                    _this.EndEditing(undefined);
                    return false;
                }
            }
        };
        // Устанавливаем фокус на таблицу если щелкнули мышкой внутри таблицы
        this.Click = function (e) {
            if (e.target.classList.contains("ChoiceFormButton")) {
                return;
            }
            if ((e.target.id == _this.name || $(e.target).parents().length) && ($(e.target).prop("tagName").toLowerCase() != "input")) {
                $(_this.idSelector + '_input').focus();
            }
        };
        // подсвечивание строки
        this.ClickOnRow = function (e) {
            if (e.target.classList.contains("ChoiceFormButton")) {
                return;
            }
            var target = $(e.target);
            var tagName = target.prop("tagName").toLowerCase();
            var targetRow;
            if (tagName == "input")
                targetRow = target.parent().parent();
            else
                targetRow = target.parent();
            targetRow.addClass('highlight').siblings().removeClass('highlight');
            if (_this.isEditable) {
                // Попытка захватить фокус если редактируется строка (нужны еще доработки)
                if ((_this.inEditing) && (e.target.className.indexOf("tableinput") == -1)) {
                    e.preventDefault();
                    //$(":focus").focus();
                    _this.obj.find(".tableinput").first().focus();
                }
            }
        };
        // двойной клик по ячейке таблицы, проиходсит вход в режим редактирования
        this.DblClickOnRow = function (e) {
            e.preventDefault();
            _this.Edit();
        };
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
        var parent = $(this.elem.parentNode);
        parent.on('keydown', this.idSelector + '_input', this.Keydown);
        parent.on('click', this.idSelector + ' > tbody', this.Click);
        parent.on('click', this.idSelector + ' > tbody > tr', this.ClickOnRow);
        parent.on('dblclick', this.idSelector + ' > tbody > tr > td', this.DblClickOnRow);
        parent.on('keydown', '.tableinput', this.InputKeydown);
        $(document).on('click', this.DocClick);
        //Выделим первую строку
        this.obj.find('tbody > tr').first().addClass('highlight');
    }
    Table.prototype.SetInputValue = function (ColName, value) {
        this.obj.find('#' + ColName + '_input').val(value);
    };
    Table.prototype.Delete = function () {
        this.obj.find('.highlight > td').remove();
        this.obj.find('tbody > tr').first().addClass('highlight');
    };
    return Table;
})();
