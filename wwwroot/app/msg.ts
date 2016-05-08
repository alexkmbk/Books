enum MsgTypes {
    MESSAGE,
    ERROR
}

function msg(message: string, _type?: MsgTypes, _title?: string) {

    var type: MsgTypes;
    var dlg: JQuery;
    var dlgContainer: JQuery;

    if (_type == undefined) type = MsgTypes.ERROR; // default value
    else type = _type;

    if (type == MsgTypes.ERROR) {
        if (_title == undefined) _title = "Error";
        dlgContainer = $("#msgdialog_global_error");
        if (dlgContainer.length == 0) {
            dlgContainer = $(document.createElement("div"));
            dlgContainer.attr("id", "msgdialog_global_error");

            // image
            //var img = $(document.createElement("img"));
            //img.attr('src', "errorImage.gif");
            //dlgContainer.append(img);

            // text
            var text = $(document.createElement("span"));
            text.attr("name", "text");
            text.attr("style", "color:red");
            dlgContainer.append(text);

            document.body.appendChild(dlgContainer.get(0));
        }
    }
    else {
        if (_title == undefined) _title = "Message";
        dlgContainer = $("#msgdialog_global_message");
        if (dlgContainer.length == 0) {
            dlgContainer = $(document.createElement("div"));
            dlgContainer.attr("id", "msgdialog_global_message");

            // image
            //var img = $(document.createElement("img"));
            //img.attr('src', "errorImage.gif");
            //dlgContainer.append(img);

            // text
            var text = $(document.createElement("span"));
            text.attr("name", "text");
            dlgContainer.append(text);

            document.body.appendChild(dlgContainer.get(0));
        }
    }

        dlg = dlgContainer.dialog({
            width: "40%",
            position: { my: "right bottom", at: "right bottom", of: window },
            title: _title
        }
        );
        dlg.find("span[name='text']").text(message);
}