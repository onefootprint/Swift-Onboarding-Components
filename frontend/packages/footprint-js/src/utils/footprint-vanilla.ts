import type { Footprint } from '../footprint-js.types';
import { createButton } from './footprint-ui';

const defer = (callback: () => void) => {
  window.setTimeout(callback, 0);
};

const startVanillaIntegration = (footprint: Footprint) => {
  if (typeof window === 'undefined') return;

  const handleButtonClicked = (publicKey: string) => {
    footprint.show({
      publicKey,
      onCanceled: () => {
        window.onFootprintCanceled?.();
      },
      onCompleted: (validationToken: string) => {
        window.onFootprintCompleted?.(validationToken);
      },
    });
  };

  const handlePageLoaded = () => {
    const container = document.getElementById('footprint-button');
    if (!container) {
      return;
    }
    const publicKey = container.getAttribute('data-public-key');
    if (!publicKey) {
      throw Error(
        'A public key must be passed as `data-public-key` in the #footprint-button element',
      );
    }
    initFootprint(publicKey, container);
  };

  const initFootprint = (publicKey: string, container: HTMLElement) => {
    const createButtonAndListen = () => {
      const button = createButton(container);
      button.addEventListener('click', () => {
        handleButtonClicked(publicKey);
      });
    };
    defer(createButtonAndListen);
  };

  document.addEventListener('DOMContentLoaded', () => handlePageLoaded());
};

export default startVanillaIntegration;
