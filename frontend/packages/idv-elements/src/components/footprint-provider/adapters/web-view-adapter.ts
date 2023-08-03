import { CompletePayload, FootprintClient } from '../types';

class WebView implements FootprintClient {
  get redirectUrl() {
    const params = new URLSearchParams(document.location.search);
    return params.get('redirect_url');
  }

  setLocation = (data: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      params.set(key, value);
    });
    window.location.href = `${this.redirectUrl}?${params.toString()}`;
  };

  load(): Promise<void> {
    return Promise.resolve();
  }

  close(): void {
    this.setLocation({ canceled: true });
  }

  cancel(): void {
    this.setLocation({ canceled: true });
  }

  on() {
    return () => {};
  }

  complete({ validationToken }: CompletePayload): void {
    this.setLocation({ validation_token: validationToken });
  }
}

export default WebView;
