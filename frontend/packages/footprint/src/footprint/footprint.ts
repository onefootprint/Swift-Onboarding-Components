import { UIManager } from '../ui';
import { Footprint, InitOptions } from './types';

export default class implements Footprint {
  private publicKey: string = '';

  constructor(private uiManager: UIManager) {}

  init({ publicKey }: InitOptions) {
    if (!publicKey) {
      throw Error('A public key must be passed in the init method');
    }
    this.publicKey = publicKey;
    return this;
  }

  async show() {
    await this.uiManager.show({ urlHash: this.publicKey });
  }

  createButton(target: HTMLElement): HTMLButtonElement {
    // TODO: Implement
    // https://linear.app/footprint/issue/FP-177/fooprintjs-createbutton-method
    const button = document.createElement('button');
    target.appendChild(button);
    return button;
  }

  onCompleted(callback: () => void) {
    this.uiManager.on('completed', callback);
  }

  onFailed(callback: () => void) {
    this.uiManager.on('failed', callback);
  }

  onUserCanceled(callback: () => void) {
    this.uiManager.on('userCanceled', callback);
  }
}
