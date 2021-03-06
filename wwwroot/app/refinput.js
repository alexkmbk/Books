// Функция, предназначена для инициализации механизма ввода ссылочных значений в полях ввода, когда с помощью автокомплита или окна выбора, необходимо
// выбрать значений из таблицы.
//
function SetRefInput(valueInputName, idInputName, container, autoCompleteSource, isChoiceForm, ChangeValueHandler, isClearButton) {
    var valueInput = container.find("input[name = '" + valueInputName + "']");
    var idInput = container.find("input[name = '" + idInputName + "']");
    var choiceFormIsOpen = false;
    // show choice button if necessary
    if (isChoiceForm) {
        if (valueInput.parent().find(".ChoiceFormButton").length == 0) {
            var button = $(document.createElement('input'));
            button.attr("type", "button");
            button.val("...");
            button.addClass("ChoiceFormButton");
            var height = 25; //input.height();
            button.width(height);
            button.height(height);
            button.on("click", function (e) {
                e.preventDefault();
                choiceFormIsOpen = true;
                var event = new CustomEvent(valueInputName + "_ChoiceFormClick");
                container.get(0).dispatchEvent(event);
                return false;
            });
            valueInput.parent().append(button);
        }
        if (autoCompleteSource) {
            valueInput.autocomplete({
                source: autoCompleteSource,
                minLength: 1,
                select: function (event, ui) {
                    ui.item ?
                        idInput.val(ui.item.Id) :
                        idInput.val("");
                    if (ChangeValueHandler)
                        ChangeValueHandler();
                },
                open: function () {
                    var z = window.document.defaultView.getComputedStyle(container.get(0)).getPropertyValue('z-index');
                    this.valueInput.autocomplete("widget").zIndex(10 + (+z));
                },
            });
            valueInput.autocomplete("widget").insertAfter(container);
        }
        valueInput.on('keydown', function (e) {
            if (e.keyCode == keyCodes.ENTER) {
                if (valueInput.val() == "") {
                    idInput.val("");
                    if (ChangeValueHandler)
                        ChangeValueHandler();
                }
            }
        });
        // clear button
        if (isClearButton && (valueInput.parent().find(".ClearRefInputButton").length == 0)) {
            var button = $(document.createElement('input'));
            button.attr("type", "button");
            button.val("X");
            button.addClass("ClearRefInputButton");
            var height = 25; //input.height();
            button.width(height);
            button.height(height);
            button.on("click", function (e) {
                valueInput.val("");
                idInput.val("");
                if (ChangeValueHandler)
                    ChangeValueHandler();
            });
            valueInput.parent().append(button);
        }
    }
}
