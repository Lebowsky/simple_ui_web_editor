

export class ListElement {
  constructor(items, elementType) {
    this.items = items;
    this.html = "";
    this.elementType = elementType;
  }
  render(addBtn = true) {
    if (addBtn) {
      this.html += `
        <div class="btn-group">
          <button class="btn-add">Add</button>
          ${`<button class="btn-paste" data-childrens-type="${this.elementType}">Paste</button>`}
        </div>
      `;
    }

    this.html += `${this.renderRows()}`;
    return this;
  }
  renderRows() {
    let html = '';
    if (!this.items || this.items.length == 0)
      return "No Items";

    this.items.forEach((item, index) => {
      html += `
        <li class="list-item ${item.itemClasses ? item.itemClasses : ''}" ${item.path ? 'title="' + item.path + '"' : ''}" data-id=${item.id} data-type="${this.elementType}">
          <div class="item-nav">
            <span class="item-name">${item.name}</span>
            ${item.value ? `<div class="item-info"><span title="${item.value}">${item.value}</span></div>` : ''}
            <div class="item-btn">
              <span class="json" title="json"><i class="fa-solid fa-code"></i></span>
              <span class="copy" title="copy"><i class="fa fa-clipboard" aria-hidden="true"></i></span>
              <span class="duplicate" title="duplicate"><i class="fa fa-copy" aria-hidden="true"></i></span>
              <span class="edit" title="edit"><i class="fa fa-edit" aria-hidden="true"></i></span>
              <span class="delete" title="delete"><i class="fa fa-trash" aria-hidden="true"></i></span>
              <span class="move"><i class="fa fa-bars" aria-hidden="true"></i></span>
            </div>
          </div>
          <div class="item-childs list" id="${this.elementType == "Processes" ? "operations" : ""}"></div>
        </li>
      `;
    });
    return html;
  }
  renderElementChild() {
    let html = '<ul class="element-childs">';
    if (!this.items || this.items.length == 0)
      return "";

    this.items.forEach((item, index) => {
      html += `
        <li class="list-item" data-id="${item.id}">
          <span class="item-name">${item.name}</span>
          ${item.value ? `<span class="item-value">${item.value}</span>` : ''}
        </li>
      `;
    });
    html += '</ul>';

    return html;
  }
  addProcessesButton($node) {
    $node.find('.btn-group').append($('<button class="btn-add cv">Add CVOperation</button>'));
    $node.find('.btn-group .btn-add').addClass('process');
    return this;
  }
}
