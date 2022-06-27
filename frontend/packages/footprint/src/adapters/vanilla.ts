import { IS_SSR } from '../config/constants';
import { Footprint } from '../footprint/types';
import defer from '../utils/defer';

const vanillaIntegration = (footprint: Footprint) => {
  const handleButtonClicked = async () => {
    await footprint.show();
    footprint.onUserCanceled(() => {
      window.onFootprintCanceled?.();
    });
    footprint.onCompleted((footprintUserId: string) => {
      window.onFootprintCompleted?.(footprintUserId);
    });
    footprint.onFailed(() => {
      window.onFootprintFailed?.();
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
    footprint.init({ publicKey });
    const createButtonAndListen = () => {
      const button = footprint.createButton(container);
      button.addEventListener('click', () => {
        handleButtonClicked();
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
