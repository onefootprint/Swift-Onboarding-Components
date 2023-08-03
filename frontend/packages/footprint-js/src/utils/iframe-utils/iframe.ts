import Postmate from '@onefootprint/postmate';

import { Props } from '../../types/components';
import { PrivateEvent } from '../../types/events';
import {
  createInlineContainer,
  createLoader,
  createOverlay,
  createOverlayContainer,
  removeDOMElements,
  removeLoader,
} from '../dom-utils';
import getUniqueId from '../get-unique-id';
import {
  getCallbackProps,
  getDataProps,
  getSanitizedProps,
} from '../prop-utils';
import getURL from '../util-utils';
import { Iframe } from './types';

const initIframe = (props: Props): Iframe => {
  let child: Postmate.ParentAPI | null = null;
  let isRendered = false;
  const sanitizedProps = getSanitizedProps(props);
  const { variant, containerId } = sanitizedProps;
  const hasOverlay = variant === 'modal' || variant === 'drawer';
  let onDestroy: (() => void) | undefined;
  let onRenderSecondary: ((secondaryProps: Props) => void) | undefined;
  const id = getUniqueId();

  const registerCallbackProps = () => {
    if (!child) {
      throw new Error(
        'Footprint should be initialized in order to listen events',
      );
    }

    const callbackProps = getCallbackProps(
      sanitizedProps,
      onDestroy,
      onRenderSecondary,
    );
    Object.entries(callbackProps).forEach(([event, callback]) => {
      child?.on(event, callback);
    });
  };

  const sendDataProps = () => {
    if (!child) {
      throw new Error(
        'Footprint should be initialized in order to receive props',
      );
    }
    child.call(PrivateEvent.propsReceived, getDataProps(sanitizedProps));
  };

  const getOrCreateContainer = (): HTMLElement | null => {
    if (hasOverlay) {
      return createOverlayContainer(id);
    }
    if (!containerId) {
      throw new Error('containerId is required when rendering inline');
    }

    // If rendering inline, find the client parent div
    const clientParent = document.getElementById(containerId);
    if (!clientParent) {
      throw new Error(
        `Could not find container with id ${containerId} while rendering footprint`,
      );
    }
    return createInlineContainer(id, clientParent);
  };

  const setLoading = (container: HTMLElement, isLoading?: boolean) => {
    if (!isLoading) {
      removeLoader(id);
      child?.frame.classList.remove(`footprint-${variant}-loading`);
      child?.frame.classList.add(`footprint-${variant}-loaded`);
      return;
    }

    if (hasOverlay) {
      const overlay = createOverlay(container, id);
      createLoader(overlay, id);
    } else {
      createLoader(container, id);
    }
  };

  const render = async () => {
    if (isRendered) {
      return;
    }
    const container = getOrCreateContainer();
    if (!container) {
      return;
    }
    if (container.hasChildNodes()) {
      container.innerHTML = '';
    }

    isRendered = true;
    setLoading(container, true);
    child = await new Postmate({
      classListArray: [`footprint-${variant}`, `footprint-${variant}-loading`],
      container,
      name: `footprint-iframe-${id}`,
      url: getURL(sanitizedProps),
      allow:
        'otp-credentials; publickey-credentials-get *; camera *; clipboard-write;',
    });

    registerCallbackProps();
    setLoading(container, false);
    child.on(PrivateEvent.started, () => {
      sendDataProps();
    });
  };

  const destroy = async () => {
    if (!isRendered) {
      return;
    }
    isRendered = false;
    await removeDOMElements(id);
    if (child) {
      child.destroy();
      child = null;
    }
  };

  const registerEvent = (
    event: 'renderSecondary' | 'destroy',
    callback: (args?: any) => void,
  ) => {
    if (event === 'renderSecondary') {
      onRenderSecondary = callback;
    }
    if (event === 'destroy') {
      onDestroy = callback;
    }
  };

  return {
    props: sanitizedProps,
    isRendered,
    render,
    destroy,
    registerEvent,
  };
};

export default initIframe;
