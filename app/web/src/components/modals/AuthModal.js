import { selectors } from "../../conf";
import { ModalWindow } from './ModalWindow';

export class AuthModal extends ModalWindow {
  constructor() {
    super();
    this.modal = $('');
    this.html = '';
  }
  render() {
    this.html = `
            <div class='modal auth' data-modal-type='auth'>
                <div class='close-modal'>
                    <i class='fa fa-times' aria-hidden='true'></i>
                </div>
                <div class='modal-head'>
                    <h2 class='modal-title'>Authorization</h2>
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
        <div class='auth-params'>
            <div class="param">
                <label for="login">Login</label>
                <input type="text" name="login" value="" id="login">
            </div>
            <div class="param">
                <label for="password">Password</label>
                <input type="password" name="password" value="" id="password">
            </div>
        </div>
        <div class="btn-wrap">
            <button onclick="auth(this)">Login</button>
        </div>
        `;
    return html;
  }
}
