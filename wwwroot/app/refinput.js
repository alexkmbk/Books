var RefInput = (function () {
    function RefInput(valueInputName, idInputName, container, autoCompleteSource, isChoiceForm) {
        this.valueInput = container.find("input[name = '" + valueInputName + "']").eq(0);
        this.idInput = container.find("input[name = '" + idInputName + "']").eq(0);
        var refinput = this;
        // show choice button if necessary
        if (isChoiceForm) {
            var button = $(document.createElement('input'));
            button.attr("type", "button");
            button.val("...");
            button.addClass("ChoiceFormButton");
            var height = 25; //input.height();
            button.width(height);
            button.height(height);
            button.on("click", function (e) {
                e.preventDefault();
                refinput.choiceFormIsOpen = true;
                var event = new CustomEvent(valueInputName + "_ChoiceFormClick");
                container.get(0).dispatchEvent(event);
                return false;
            });
            this.valueInput.append(button);
            if (autoCompleteSource) {
                var idInput = this.idInput;
                this.valueInput.autocomplete({
                    source: autoCompleteSource,
                    minLength: 1,
                    select: function (event, ui) {
                        ui.item ?
                            idInput.val(ui.item.Id) :
                            idInput.val("");
                    },
                    open: function () {
                        var z = window.document.defaultView.getComputedStyle(container.get(0)).getPropertyValue('z-index');
                        //container.autoComplete.zIndex(10 + (+z));
                    },
                });
            }
        }
    }
    return RefInput;
})();
