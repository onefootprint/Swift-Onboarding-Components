import Postmate from '@onefootprint/postmate';

import type { FormRef, Props } from '../../types/components';
import { ComponentKind } from '../../types/components';
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
  omitCallbacksAndRefs,
  sanitizeAndValidateProps,
} from '../prop-utils';
import getURL from '../url-utils';
import type { Iframe, OnDestroy, OnRenderSecondary } from './types';

type Child = Postmate.ParentAPI;

const initIframe = (rawProps: Props): Iframe => {
  let child: Child | null = null;
  let isRendered = false;
  let onDestroy: OnDestroy;
  let onRenderSecondary: OnRenderSecondary;
  const props = sanitizeAndValidateProps(rawProps);
  const { variant, containerId } = props;
  const hasOverlay = variant === 'modal' || variant === 'drawer';
  const id = getUniqueId();

  const registerCallbackProps = () => {
    if (!child) {
      throw new Error(
        'Footprint should be initialized in order to listen events',
      );
    }

    const callbackProps = getCallbackProps(props, onDestroy, onRenderSecondary);
    Object.entries(callbackProps).forEach(([event, callback]) => {
      child?.on(event, callback);
    });
  };

  const getOrCreateContainer = (): HTMLElement => {
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

  const setLoading = (container: HTMLElement, isLoading: boolean) => {
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

  const sendDataProps = () => {
    if (!child) {
      throw new Error(
        'Footprint should be initialized in order to receive props',
      );
    }
    const dataProps = omitCallbacksAndRefs(props);
    child.call(PrivateEvent.propsReceived, dataProps);
  };

  const setUpFormRefs = () => {
    if (!child) {
      throw new Error(
        'Footprint should be initialized in order to set up refs',
      );
    }
    // For now we only support refs on the form component
    if (props.kind !== ComponentKind.Form || !props.getRef) {
      return;
    }

    const formRef: FormRef = {
      save: () => {
        if (!child) {
          throw new Error(
            'Footprint should be initialized to call ref methods',
          );
        }
        return new Promise(resolve => {
          child?.call(PrivateEvent.formSaved);
          child?.on(PrivateEvent.formSaveComplete, () => {
            resolve();
          });
        });
      },
    };
    props.getRef?.(formRef);
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

    const url = getURL(props);
    isRendered = true;

    setLoading(container, true);
    child = await new Postmate({
      classListArray: [`footprint-${variant}`, `footprint-${variant}-loading`],
      container,
      name: `footprint-iframe-${id}`,
      url,
      allow:
        'otp-credentials; publickey-credentials-get *; camera *; clipboard-write;',
    });
    setLoading(container, false);

    registerCallbackProps();
    child.on(PrivateEvent.started, () => {
      sendDataProps();
      setUpFormRefs();
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

  const registerOnDestroy = (callback: OnDestroy) => {
    if (!callback || typeof callback !== 'function') return;
    onDestroy = callback;
  };

  const registerOnRenderSecondary = (callback: OnRenderSecondary) => {
    if (!callback || typeof callback !== 'function') return;
    onRenderSecondary = callback;
  };

  return {
    props,
    isRendered,
    render,
    destroy,
    registerOnDestroy,
    registerOnRenderSecondary,
  };
};

export default initIframe;
