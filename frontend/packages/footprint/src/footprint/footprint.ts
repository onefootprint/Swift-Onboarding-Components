import {
  Flow,
  Footprint,
  FootprintEvents,
  InitOptions,
  UIManager,
} from './types';

export default class implements Footprint {
  private publicKey: string | null = null;

  private flow: Flow = 'onboarding';

  constructor(private bifrostUrl: string, private uiManager: UIManager) {}

  init({ publicKey, flow }: InitOptions) {
    if (publicKey) {
      this.publicKey = publicKey;
    }
    if (flow) {
      this.flow = flow;
    }
    return this;
  }

  async show() {
    const params = new URLSearchParams();
    params.append('flow', this.flow);
    if (this.publicKey) {
      params.append('public_key', this.publicKey);
    }
    await this.uiManager.show({
      url: `${this.bifrostUrl}?${params.toString()}`,
    });
  }

  createButton(container: HTMLElement) {
    return this.uiManager.createButton(container);
  }

  onAuthenticated(callback: (vtok: string) => void) {
    this.uiManager.on(FootprintEvents.authenticated, (data: any) => {
      if (data && typeof data === 'string') {
        callback(data);
      }
    });
  }

  onCompleted(callback: (footprintUserId: string) => void) {
    this.uiManager.on(FootprintEvents.completed, (data: any) => {
      if (data && typeof data === 'string') {
        callback(data);
      }
    });
  }

  onFailed(callback: () => void) {
    this.uiManager.on(FootprintEvents.failed, callback);
  }

  onUserCanceled(callback: () => void) {
    this.uiManager.on(FootprintEvents.userCanceled, callback);
  }
}
