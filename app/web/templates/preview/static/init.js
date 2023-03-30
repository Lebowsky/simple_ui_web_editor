$(document).ready(function () {
    namespace = '/simpleweb';
    var socket = io(namespace, {reconnection: false, path: "/ws/socket.io"});
    var sid = socket.id
    var DELAY = 250, clicks = 0, timer = null;
    let code = "";
    let reading = false;

    $(document).on('keypress', function (e) {
        if (e.keyCode === 13) {
            if (code.length > 10) {
                console.log(code);
                formdata = { data: 'barcode', barcode: code }
                socket.emit('input_event', formdata);

                code = "";
            }
        } else {
            code += e.key;
        }

        if (!reading) {
            reading = true;
            setTimeout(() => {
                code = "";
                reading = false;
            }, 200);
        }
    });

    $(document).on('click', 'tr', function () {
        var id = $(this).attr("id")
        var index = $(this).index()
        var tableid = $(this).closest('table').attr("id")
        var selected = $('#' + id).hasClass("highlight");

        $("#" + tableid + " tr").removeClass("highlight");
        if (!selected)
            $('#' + id).addClass("highlight");

        formdata = { data: 'table_click_raw', index: index, source: id }
        socket.emit('input_event', formdata);
        clicks++;

        if (clicks === 1) {

            timer = setTimeout(function () {
                formdata = { data: 'table_click', index: index, source: id }
                socket.emit('input_event', formdata);
                clicks = 0;
            }, DELAY);

        } else {
            clearTimeout(timer);    //prevent single-click action
            formdata = { data: 'table_doubleclick', index: index, source: id }
            socket.emit('input_event', formdata);
            clicks = 0;
        }
    });
    $(document).on('input', 'table td', function () {
        formdata = { data: 'table_edit', index: ($(this).closest('tr').index()), source_row: ($(this).closest('tr').attr("id")), source_column: ($(this).index()), valuetext: ($(this).text()), valuecb: $(this).find('input').is(":checked") }
        socket.emit('input_event', formdata);
    });
    $(document).on('click', '.card', function () {
        formdata = { data: 'card_click', index: ($(this).index()), source: ($(this).attr("id")) }
        socket.emit('input_event', formdata);
    });
    $(document).on('propertychange change keyup paste input', '.autotext', function () {
        formdata = { data: 'text_input', index: ($(this).index()), source: ($(this).attr("id")), value: ($(this).val()) }
        socket.emit('input_event', formdata);
    });
    $(document).on('click', 'button', function () {
        var clickedID = this.id

        if (clickedID.includes('maintab_')) {
            formdata = { data: 'select_tab', source: clickedID.substring(8) }
            socket.emit('select_tab', formdata);
        }
        else if (clickedID.includes('cardrow_')) {
            formdata = { data: 'card_event', source: clickedID }
            socket.emit('input_event', formdata);
        }
        else if (clickedID.includes('onResultPositive') || clickedID.includes('onResultNegative')) {
            //do nothing
        }
        else {
            jsonObj = [];
            $("input").each(function () {
                var id = $(this).attr("id");
                var v = $(this).val();
                item = {}
                item[id] = v;
                jsonObj.push(item);
            });

            $("textarea").each(function () {
                var id = $(this).attr("id");
                var v = $(this).val();
                item = {}
                item[id] = v;
                jsonObj.push(item);
            });

            jsonString = JSON.stringify(jsonObj);
            formdata = { data: 'button', values: jsonString, source: clickedID, sid: sid }
            socket.emit('input_event', formdata);
        }
    });
    $(document).on('click', "[id*='spanmaintab_']", function () {
        var clickedID = this.id
        formdata = { data: 'ttt', source: clickedID.substring(12) }
        socket.emit('close_maintab', formdata);
        var element = document.getElementById(clickedID.substring(12));
        element.parentNode.removeChild(element);
        var element2 = document.getElementById("maintab_" + clickedID.substring(12));
        element2.parentNode.removeChild(element2);
    });
    $("[id*='spanmaintab_']").click(function () {
        var clickedID = this.id
        formdata = { data: 'ttt', source: clickedID.substring(12) }
        socket.emit('close_maintab', formdata);
        var element = document.getElementById(clickedID.substring(12));
        element.parentNode.removeChild(element);
        var element2 = document.getElementById("maintab_" + clickedID.substring(12));
        element2.parentNode.removeChild(element2);
    });
    $("#sidenav").click(function (e) {
        var clickedOn = $(e.target);
        socket.emit('run_process', clickedOn.text());
    });
    socket.on('connect', function () {
        socket.emit('connect_event', { data: 'connected to the SocketServer...' });
    });
    async function UploadFile(data) {
        let formData = new FormData();
        let f = $('#' + data.file_id).prop('files')[0];
        formData.append("file", f);
        const ctrl = new AbortController()
        setTimeout(() => ctrl.abort(), 10000);

        try {
            let r = await fetch('/upload_file?id=' + data.file_id + '&sid=' + socket.id,
                { method: "POST", body: formData, signal: ctrl.signal });
            console.log('HTTP response code:', r.status);
        } catch (e) {
            console.log('Some problem...:', e);
        }
    }

    socket.on('upload_file', function (data) {
        alert(data.file_id);

        if (!$('#' + data.file_id).val()) {
            alert("No file selected!");

        } else {

            UploadFile(data)
        }
    });
    socket.on('setvalue', function (data) {

        //$("#"+data.key).val(data.value).trigger('change'); 
        $("#" + data.key).html(data.value);
    });
    socket.on('setvaluepulse', function (data) {
        $("#" + data.key).html(data.value);
        var animTime = 200;
        $("#" + data.key).animate({ "backgroundColor": "#f44336" }, 1000).animate({ "backgroundColor": "#ffffff" }, 1000);
    });
    socket.on('setvaluehtml', function (data) {
        $("#" + data.key).html(data.value);
    });
    socket.on('setmenulisteners', function (data) {
        var dropdown = document.getElementsByClassName("dropdown-btn");
        var i;

        for (i = 0; i < dropdown.length; i++) {
            dropdown[i].addEventListener("click", function () {
                this.classList.toggle("active");
                var dropdownContent = this.nextElementSibling;
                if (dropdownContent.style.display === "block") {
                    dropdownContent.style.display = "none";
                } else {
                    dropdownContent.style.display = "block";
                }
            });
        }
    });
    socket.on('add_html', function (data) {
        $('#' + data.id).append(data.code);
    });
    socket.on('close_tab', function (data) {
        var element = document.getElementById(data.tabid);
        element.parentNode.removeChild(element);

        var element2 = document.getElementById(data.buttonid);
        element2.parentNode.removeChild(element2);
    });
    socket.on('run_datatable', function (data) {
        $('#' + data.id).DataTable({
            "language": {
                "search": "Искать",
                "lengthMenu": "Показать _MENU_ строк",
                "zeroRecords": "Нет строк",
                "info": "Показано _PAGE_ из _PAGES_",
                "infoFiltered": "(отобрано from _MAX_ всего записей)",
                "paginate": {
                    "first": "Первые",
                    "last": "Последние",
                    "next": "Следующий",
                    "previous": "Предыдущий"
                }

            }
        });
    });
    socket.on('notification', function (data) {
        if (!("Notification" in window)) {
        } else if (Notification.permission === "granted") {
            const notification = new Notification(data.text);
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                    const notification = new Notification(data.text);
                }
            });
        }
    });
    socket.on('error', function (data) {
        document.getElementById("errorModal").style.display = "block";
        document.getElementById("errorbody").innerHTML = data.code;
        $("#toastModal").delay(3200).fadeOut(300);
    });
    socket.on('toast', function (data) {
        document.getElementById("toastModal").style.display = "block";
        document.getElementById("toastbody").innerHTML = data.code;
        $("#toastModal").delay(3200).fadeOut(300);
    });
    socket.on('beep', function (data) {
        var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
        snd.play();
    });
    socket.on('show_dialog', function (data) {
        const modal = document.querySelector("dialog")
        modal.showModal();
        const closeBtns = document.getElementsByClassName("closedialog");

        for (btn of closeBtns) {
            btn.addEventListener("click", dialogbutton)
        }

        function dialogbutton(event) {
            socket.emit('input_event', { data: "dialog_result", source: event.target.id });
            modal.close();
        }
    });
    socket.on('show_modal', function (data) {
        const modal = document.querySelector("dialog")
        modal.showModal();
        const closeBtns = document.getElementsByClassName("closedialog");

        for (btn of closeBtns) {
            btn.addEventListener("click", dialogbutton)
        }

        function dialogbutton(event) {
            jsonObj = [];
            $("#contentModal :input").each(function () {

                var id = $(this).attr("id");
                var v = $(this).val();

                if ($(this).attr('type') == 'checkbox') {

                    v = $(this).is(":checked");
                };

                item = {};

                item[id] = v;

                jsonObj.push(item);
            });

            $("#contentModal textarea").each(function () {

                var id = $(this).attr("id");
                var v = $(this).val();

                item = {}

                item[id] = v;

                jsonObj.push(item);
            });
            jsonString = JSON.stringify(jsonObj);
            socket.emit('input_event', { data: "edittable_result", source: event.target.id, values: jsonString, table_id: data.table_id, selected_line_id: data.selected_line_id });
            modal.close();
        }
    });
    socket.on('click_button', function (data) {
        document.getElementById(data.id).click();
    });
    socket.on('add_html_body', function (data) {
        $('body').append(data.code);
    });
    socket.on('reload', function (data) {
        location.reload();
    });
    $('form#emit').submit(function (event) {
        socket.emit('input_event', { data: $('#emit_data').val() });
        return false;
    });
    $('form#disconnect').submit(function (event) {
        socket.emit('disconnect_request');
        return false;
    });
});