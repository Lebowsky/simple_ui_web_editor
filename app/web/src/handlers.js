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
