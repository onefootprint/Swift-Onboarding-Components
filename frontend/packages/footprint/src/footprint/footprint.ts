import type { UIManager } from './types';
import { Events, Footprint, InitOptions } from './types';

export default class implements Footprint {
  private publicKey: string | null = null;

  constructor(private bifrostUrl: string, private uiManager: UIManager) {}

  init({ publicKey }: InitOptions) {
    if (!publicKey) {
      throw Error('A public key must be passed in the init method');
    }
    this.publicKey = publicKey;
    return this;
  }

  async show() {
    await this.uiManager.show({
      url: `${this.bifrostUrl}?public_key=${this.publicKey}`,
    });
  }

  createButton(container: HTMLElement) {
    return this.uiManager.createButton(container);
  }

  onCompleted(callback: (footprintUserId: string) => void) {
    this.uiManager.on(Events.completed, (data: any) => {
      if (data && typeof data === 'string') {
        callback(data);
      }
    });
  }

  onFailed(callback: () => void) {
    this.uiManager.on(Events.failed, callback);
  }

  onUserCanceled(callback: () => void) {
    this.uiManager.on(Events.userCanceled, callback);
  }
}
