import './styles.css';

import initIframeManager from './iframe-manager';
import { Component, Footprint, Props } from './types/components';

const initFootprint = (): Footprint => {
  const init = (props: Props): Component => {
    let isRendered = false;

    const render = async (): Promise<void> => {
      if (isRendered) {
        return;
      }
      isRendered = true;
      await iframeManager.render();
    };

    const destroy = async (): Promise<void> => {
      if (!isRendered) {
        return;
      }
      iframeManager.destroy();
      isRendered = false;
    };

    const iframeManager = initIframeManager(props, () => {
      isRendered = false;
    });

    return {
      render,
      destroy,
    };
  };

  return {
    init,
  };
};

const footprint = initFootprint();
export default footprint;
