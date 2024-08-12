import $ from 'jquery'

export function sortableInit(node) {
  $(node).sortable({
    items: "> li",
    containment: "parent",
    cursor: "grabbing",
    handle: ".move",
    update: function (event, ui) {
      let element1Id = ui.item.attr("data-id");
      let element2Id
      if (ui.originalPosition.top < ui.position.top)
        element2Id = ui.item.prev().attr("data-id");
      else
        element2Id = ui.item.next().attr("data-id");

      document.main.configGraph.moveElement(element1Id, element2Id);
    }
  });
}

export function togglePrev() {
  $(".prev-wrap").toggleClass("show");
}

export function renderEditor(node, data = '') {
  // TODO
  // const editor = new JSONEditor(node, {
  //   mode: 'code'
  // });

  // editor.set(data);

  // return editor;
}
export function toggleMainMenu() {
  $('.toggle-mnu').toggleClass("on")
  $('.btn-group.main').toggleClass("active")
}

export function selectTab(tabNode) {
  $(".tabs .tab").removeClass("active");
  $(tabNode).addClass("active");

  var tabID = $(tabNode).attr("data-tab-id");

  $(".main-conf-wrap section").removeClass("active");
  $(".main-conf-wrap #" + tabID).addClass("active");

  if ($(tabNode).data('tab-id') === 'main-conf-process') {
    sendDataToUpdatePreview();
    $("#main-conf-screen").addClass('active');
    $("#main-conf-cvframes").addClass('active');
  } else {
    $("#main-conf-screen").removeClass('active');
    $("#main-conf-cvframes").removeClass('active');
  }
}

export async function sendDataToUpdatePreview(dataToSend) {
  return// TODO проверить работу превью
  let data;
  if (dataToSend) {
    data = {
      "action": "screen_items",
      "data": dataToSend
    };
  } else {
    //берем заголовки только у не скрытых процессов
    const processesList = document.main.configGraph.elements
      .filter((el) => el.parentType == 'Processes' && el.elementValues['hidden'] == false)
      .map((item) => item.title);

    data = {
      "action": "processes_list",
      "data": processesList
    };
  }
  try {
    const response = await fetch('http://localhost:5000/ws_editor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Ошибка: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log("Ответ сервера:", responseData);
  } catch (error) {
    console.error("Ошибка при обмене данными с сервером:", error);
  }
}