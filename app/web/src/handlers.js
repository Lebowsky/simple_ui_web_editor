import { selectors } from "./conf";
import { notificate } from "./dialogs";
import { sendSqlQueryToDevice } from "./export";
import { ModalWindow, SQLQueryModal } from "./renderElements";

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

export async function sendSQLQuery(node) {
  let query = $('#sql-query').val();
  let params = $('#query-params').val();
  let nodeText = $(node).text();

  if (!document.main.settings.deviceHost) {
    notificate('Device connection error');
    return
  }

  const query_params = {
    device_host: document.main.settings.deviceHost || '',
    db_name: $('#db-name').val(),
    query: query,
    params: params
  };

  $(node).html(`<i class="fa-solid fa-spinner preloader" aria-hidden="true"></i>`)

  const result = await sendSqlQueryToDevice(query_params);

  $(node).html(nodeText)

  if (result) {
    if (result.error) {
      notificate(result.content);
    } else {
      if (!document.main.settings.sqlQuerys.find((el) => el.query == query && el.params == params))
        document.main.settings.sqlQuerys.push({ query: query, params: params });

      $(".querys-wrap").html(SQLQueryModal.renderSqlQueryHistory(document.main.settings.sqlQuerys));

      document.modal = ModalWindow.getCurrentModal();
      document.modal.renderSqlQueryResult(result.data);
    }
  }
}

export function selectModalTab(tabNode) {
  // $(".tabs .tab").removeClass("active");
  $(tabNode).siblings().removeClass("active");
  $(tabNode).addClass("active");

  const tabID = $(tabNode).attr("data-tab");
  const modal = ModalWindow.getCurrentModal()?.modal;

  if (!modal) return

  modal.find(".params").find(".param").removeClass("active");
  const $currentTab = modal.find(".params").find(".param[data-tab=" + tabID + "]")
  $currentTab.addClass("active");

  if (['elements', 'handlers'].includes(tabID)) {
    const label = $currentTab.find('label');
    showList(label, 'down');
  }
}
function showList(node, direction = "toggle") {
  if (direction == "up") {
    $(node).siblings(selectors.listWrap).slideUp();
    $(node).find("i").removeClass("fa-angle-up").addClass("fa-angle-down");
  } else if (direction == "down") {
    $(node).siblings(selectors.listWrap).slideDown();
    $(node).find("i").removeClass("fa-angle-down").addClass("fa-angle-up");
  } else {
    $(node).siblings(selectors.listWrap).slideToggle();

    if ($(node).find("i").hasClass("fa-angle-down")) {
      $(node).find("i").removeClass("fa-angle-down").addClass("fa-angle-up");
    } else if ($(node).find("i").hasClass("fa-angle-up")) {
      $(node).find("i").removeClass("fa-angle-up").addClass("fa-angle-down");
    }
  }
}

export function renderEditor(node, data = '') {
  // const editor = new JSONEditor(node, {
  //   mode: 'code'
  // });

  // editor.set(data);

  // return editor;
}