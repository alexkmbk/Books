﻿
   function  SetRefInput(valueInputName: string, idInputName: string, container: JQuery, autoCompleteSource: string, isChoiceForm: boolean) {
        var valueInput = container.find("input[name = '" + valueInputName + "']");
        var idInput = container.find("input[name = '" + idInputName + "']");
        var choiceFormIsOpen = false;

        // show choice button if necessary
        if (isChoiceForm) {
            var button: JQuery;
            var foundButtons = valueInput.parent().find(".ChoiceFormButton");
            if (foundButtons.length == 0) {
                var button = $(document.createElement('input'));
                button.attr("type", "button");
                button.val("...");
                button.addClass("ChoiceFormButton");
                var height = 25;//input.height();
                button.width(height);
                button.height(height);
            }
            else button = foundButtons.eq(0);
            button.on("click", function (e: MouseEvent) {
                e.preventDefault();
                choiceFormIsOpen = true;
                var event = new CustomEvent(valueInputName + "_ChoiceFormClick");
                container.get(0).dispatchEvent(event);
                return false;
            });
            valueInput.parent().append(button);
            if (autoCompleteSource) {
                var idInput = idInput;
                valueInput.autocomplete({
                    source: autoCompleteSource,
                    minLength: 1,
                    select: function (event, ui) {
                        ui.item ?
                            idInput.val(ui.item.Id) :
                            idInput.val("");
                    },
                    open: function () {
                        var z = window.document.defaultView.getComputedStyle(container.get(0)).getPropertyValue('z-index');
                        this.valueInput.autocomplete("widget").zIndex(10 + (+z));
                    },
                });
               valueInput.autocomplete("widget").insertAfter(container);
            }
        }
    }