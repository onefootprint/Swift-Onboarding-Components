import Postmate from '@onefootprint/postmate';

import { ComponentCallbacksByEvent } from './constants/callbacks';
import { Props } from './types/components';
import { PrivateEvent, PublicEvent } from './types/events';
import checkIsKindValid from './utils/check-is-kind-valid';
import checkIsVariantValid from './utils/check-is-variant-valid';
import {
  createInlineContainer,
  createLoader,
  createOverlay,
  createOverlayContainer,
  getUniqueDomId,
  removeDOMElements,
  removeLoader,
} from './utils/dom-utils';
import getURL from './utils/get-url';

type IframeManager = {
  render: () => Promise<void>;
  destroy: () => void;
};

const initIframeManager = (
  props: Props,
  onDestroy: () => void,
): IframeManager => {
  let child: Postmate.ParentAPI | null = null;
  const { kind, appearance, variant = 'modal', ...customProps } = props;
  checkIsKindValid(kind);
  checkIsVariantValid(kind, variant);
  const variantName =
    variant === 'drawer' || variant === 'modal' ? variant : 'inline';
  const callbacks = ComponentCallbacksByEvent[kind] ?? {};
  const hasOverlay = variant === 'modal' || variant === 'drawer';
  const uniqueId = getUniqueDomId();

  const registerEvents = () => {
    if (!child) {
      throw new Error(
        'Footprint should be initialized in order to listen events',
      );
    }

    Object.entries(callbacks).forEach(([event, callbackPropName]) => {
      const publicEvent = event as PublicEvent;
      if (!Object.values(PublicEvent).includes(publicEvent)) {
        return;
      }

      // Even if the user didn't specify a callback, we need to
      // listen to for events that should trigger unmount
      let callback = (props as any)[callbackPropName];
      if (!callback || typeof callback !== 'function') {
        callback = () => {};
      }
      const shouldDestroy =
        publicEvent === PublicEvent.closed ||
        publicEvent === PublicEvent.canceled;
      child?.on(
        publicEvent,
        shouldDestroy
          ? () => {
              callback();
              destroy();
            }
          : callback,
      );
    });
  };

  const sendDataProps = () => {
    if (!child) {
      throw new Error(
        'Footprint should be initialized in order to receive props',
      );
    }

    // We need to omit kind, appearance and callback props from the props sent to the iframe
    // Functions cannot be sent via post message and appearance is already sent via URL
    const callbackPropNames = Object.values(callbacks);
    const filteredProps = Object.fromEntries(
      Object.entries(customProps).filter(
        ([key]) => !callbackPropNames.includes(key),
      ),
    );

    child.call(PrivateEvent.propsReceived, {
      ...filteredProps,
      variant: variantName,
    });
  };

  const getOrCreateContainer = (): HTMLElement | null => {
    if (hasOverlay) {
      return createOverlayContainer(uniqueId);
    }

    // If rendering inline, find the client parent div
    const { containerId } = variant;
    const clientParent = document.getElementById(containerId);
    if (!clientParent) {
      throw new Error(
        `Could not find container with id ${containerId} while rendering footprint`,
      );
    }
    return createInlineContainer(uniqueId, clientParent);
  };

  const setLoading = (container: HTMLElement, isLoading?: boolean) => {
    if (!isLoading) {
      removeLoader(uniqueId);
      child?.frame.classList.remove(`footprint-${variantName}-loading`);
      child?.frame.classList.add(`footprint-${variantName}-loaded`);

      return;
    }

    if (hasOverlay) {
      const overlay = createOverlay(container, uniqueId);
      createLoader(overlay, uniqueId);
    } else {
      createLoader(container, uniqueId);
    }
  };

  const render = async () => {
    const container = getOrCreateContainer();
    if (!container) {
      return;
    }
    if (container.hasChildNodes()) {
      container.innerHTML = '';
    }

    setLoading(container, true);
    child = await new Postmate({
      classListArray: [
        `footprint-${variantName}`,
        `footprint-${variantName}-loading`,
      ],
      container,
      name: `footprint-iframe-${uniqueId}`,
      url: getURL(props),
      allow:
        'otp-credentials; publickey-credentials-get *; camera *; clipboard-write;',
    });
    registerEvents();
    setLoading(container, false);

    child.on(PrivateEvent.started, () => {
      sendDataProps();
    });
  };

  const destroy = () => {
    removeDOMElements(uniqueId);
    if (child) {
      child.destroy();
      child = null;
    }
    onDestroy();
  };

  return {
    render,
    destroy,
  };
};

export default initIframeManager;
