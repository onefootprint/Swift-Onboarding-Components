import { Footprint } from '../footprint-types';
import { createButton } from './ui-manager';

const IS_SSR = typeof window === 'undefined';

const defer = (callback: () => void) => {
  window.setTimeout(callback, 0);
};

const vanillaIntegration = (footprint: Footprint) => {
  const handleButtonClicked = async (publicKey: string) => {
    await footprint.show({
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

  const waitDomToLoad = () => {
    if (IS_SSR) return;
    document.addEventListener('DOMContentLoaded', () => handlePageLoaded());
  };

  return () => {
    waitDomToLoad();
  };
};

export default vanillaIntegration;
