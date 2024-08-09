import { selectors } from "../../conf";
import { ModalWindow } from './ModalWindow';
import { sendSqlQueryToDevice } from "../../export";
import { getCurrentModal } from "./modalsRoot";

export class SQLQueryModal extends ModalWindow {
  constructor(ipAddress) {
    super();
    this.modal = $('');
    this.html = '';
    this.ipAddress = ipAddress;
    this.dbName = 'SimpleKeep';
    this.params = '';
    this.query = 'SELECT * from RS_docs';
  }
  render() {
    this.html = `
            <div class='modal sql-query' data-modal-type='sql-query'>
                <div class='close-modal'>
                    <i class='fa fa-times' aria-hidden='true'></i>
                </div>
                <div class='modal-head'>
                    <h2 class='modal-title'>SQL Queries<span class='edited'>*</span></h2>
                </div>
                <div class='modal-content'></div>
            </div>
            `;
    this.modal = $(this.html);
    this.modal.find(selectors.modalContent).html(this.renderContent());

    return this;
  }
  renderContent() {
    const html = `
        <div>
            <div id="sql-query-content">
                <div id="query-params-wrap">
                    <div class="param">
                        <label for="ip-address">IP Address</label>
                        <input type="text" name="ip-address" value="${this.ipAddress}" id="ip-address">
                    </div>
                    <div class="param">
                        <label for="db-name">DB Name</label>
                        <input type="text" name="db-name" value="${this.dbName}" id="db-name">
                    </div>
                    <div class="param">
                        <label for="query-params">Params</label>
                        <input type="text" name="query-params" value="${this.params}" id="query-params">
                    </div>
                </div>
                <div class="param">
                    <textarea name="query" cols="80" rows="8" id="sql-query">${this.query}</textarea>
                    <div class="btn-wrap">
                        <button id="send-sql-query-btn">select</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="querys-wrap">${SQLQueryModal.renderSqlQueryHistory(document.main.settings.sqlQuerys)}</div>
        <div id="sql-table-wrap"> </div>
        `;
    return html;
  }
  static renderSqlQueryHistory(querys) {
    let html = "";

    if (querys && querys.length) {
      html += `
            <div class="section-header" onclick="showList(this)">Query history<i class="fa fa-angle-down" aria-hidden="true"></i></div>
            <ul class="list-wrap querys">
                ${querys.map((el, index) => `<li data-params="${el.params}">${el.query}<i class="fa fa-times" aria-hidden="true"></i></li>`).join('\n')}
            </ul>
            `;
    }
    return html;
  }
  renderSqlQueryResult(data) {
    let html = ``;

    if (data) {
      html = `
            <span class="show-sql-table-json"><i class="fa-solid fa-code"></i></span>
            <table class="sql-table display nowrap dataTable no-footer dtr-inline collapsed">
                <thead>
                    ${data.header.split('|').map((el) => `<th>${el}</th>`).join('\n')}
                </thead>
                <tbody>
                ${data.data.map((el) => `<tr>${el.split('|').map((el) => `<td>${el}</td>`).join('\n')}</tr>`).join('\n')}
                </tbody>
            </table>
            `;
    } else if (data == null) {
      html = `Нет записей`;
    }
    this.modal.find('#sql-table-wrap').html(html);
    this.modal.find('.sql-table').DataTable({
      responsive: true,
      pageLength: localStorage.getItem('lengthTable') ? localStorage.getItem('lengthTable') : 10,
      language: {
        "lengthMenu": "_MENU_",
        "url": "https://cdn.datatables.net/plug-ins/1.13.4/i18n/ru.json"
      }
    });
    this.modal.find('.sql-table').on('length.dt', function (e, settings, len) {
      localStorage.setItem('lengthTable', len);
    });
  }
  show() {
    super.show();
    const btn = document.querySelector('#send-sql-query-btn');
    btn.addEventListener('click', () => SQLQueryModal.sendSQLQuery(btn));
  }

  static async sendSQLQuery(node) {
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
  
        document.modal = getCurrentModal();
        document.modal.renderSqlQueryResult(result.data);
      }
    }
  }
}
