import './styles.css';

import type { Component, Footprint, Props } from './types/components';
import initIframe from './utils/iframe-utils/iframe';
import initIframeManager from './utils/iframe-utils/iframe-manager';
import type { Iframe } from './utils/iframe-utils/types';

const getFootprint = (): Footprint => {
  const manager = initIframeManager();

  const init = (props: Props): Component => {
    let iframe = initIframe(props);

    const destroy = async () => {
      manager.remove(iframe);
      await iframe.destroy();
    };

    const destroySecondary = async (secondary: Iframe) => {
      manager.removeSecondary(iframe, secondary);
      await secondary.destroy();
    };

    const renderSecondary = async (secondaryProps: Props) => {
      let secondaryIframe = initIframe(secondaryProps);
      secondaryIframe = manager.getOrCreateSecondary(iframe, secondaryIframe);
      secondaryIframe.registerOnDestroy(() => {
        destroySecondary(secondaryIframe);
      });
      secondaryIframe.render();
    };

    const render = async () => {
      iframe = manager.getOrCreate(iframe);
      iframe.registerOnDestroy(destroy);
      iframe.registerOnRenderSecondary(renderSecondary);
      await iframe.render();
    };

    return {
      render,
      destroy,
    };
  };

  return {
    init,
  };
};

const footprint = getFootprint();
export default footprint;
