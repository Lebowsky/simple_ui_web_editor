export function sortableInit(node) {
    $(node).sortable({
      items: "> li",
      containment: "parent",
      cursor: "grabbing",
      handle: ".move",
      update: function (event, ui) {
        let element1Id = ui.item.attr("data-id");
  
        if (ui.originalPosition.top < ui.position.top)
          element2Id = ui.item.prev().attr("data-id");
        else
          element2Id = ui.item.next().attr("data-id");
  
        main.configGraph.moveElement(element1Id, element2Id);
      }
    });
  }