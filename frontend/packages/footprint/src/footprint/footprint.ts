import type { Flow, Footprint, UIManager } from './types';
import { FootprintEvents } from './types';

export default class implements Footprint {
  private publicKey: string | null = null;

  private flow: Flow = 'authentication';

  constructor(private url: string, private uiManager: UIManager) {}

  init(options: { publicKey?: string } = {}) {
    if (options.publicKey) {
      this.flow = 'onboarding';
      this.publicKey = options.publicKey;
    }
  }

  private onAuthenticated(callback: (vtok: string) => void) {
    return this.uiManager.on(FootprintEvents.authenticated, (data: any) => {
      if (data && typeof data === 'string') {
        callback(data);
      }
    });
  }

  private onCompleted(callback: (footprintUserId: string) => void) {
    return this.uiManager.on(FootprintEvents.completed, (data: any) => {
      if (data && typeof data === 'string') {
        callback(data);
      }
    });
  }

  private onUserCanceled(callback: () => void) {
    return this.uiManager.on(FootprintEvents.userCanceled, callback);
  }

  async show(
    callback: {
      onAuthenticated?: (vtok: string) => void;
      onCompleted?: (footprintUserId: string) => void;
      onUserCanceled?: () => void;
    } = {},
  ) {
    const params = new URLSearchParams();
    params.append('flow', this.flow);
    if (this.publicKey) {
      params.append('public_key', this.publicKey);
    }
    await this.uiManager.show({
      url: `${this.url}?${params.toString()}`,
    });
    if (callback.onAuthenticated) {
      this.onAuthenticated(callback.onAuthenticated);
    }
    if (callback.onCompleted) {
      this.onCompleted(callback.onCompleted);
    }
    if (callback.onUserCanceled) {
      this.onUserCanceled(callback.onUserCanceled);
    }
  }

  createButton(container: HTMLElement) {
    return this.uiManager.createButton(container);
  }
}
