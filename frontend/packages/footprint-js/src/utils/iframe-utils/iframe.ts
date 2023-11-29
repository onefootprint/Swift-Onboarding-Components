import Postmate from '@onefootprint/postmate';

import { version } from '../../../package.json';
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
import { getCallbackProps, sanitizeAndValidateProps } from '../prop-utils';
import sendSdkArgs from '../send-sdk-args';
import getURL, { getWindowUrl } from '../url-utils';
import type { Iframe, OnDestroy, OnRenderSecondary } from './types';

type ParentApi = Postmate.ParentAPI;

const initIframe = (rawProps: Props): Iframe => {
  let parentApi: ParentApi | null = null;
  let isRendered = false;
  let onDestroy: OnDestroy;
  let onRenderSecondary: OnRenderSecondary;
  const props = sanitizeAndValidateProps(rawProps);
  const { variant, containerId } = props;
  const hasOverlay = variant === 'modal' || variant === 'drawer';
  const id = getUniqueId();

  const registerCallbackProps = () => {
    if (!parentApi) {
      throw new Error(
        'Footprint should be initialized in order to listen events',
      );
    }

    const callbackProps = getCallbackProps(props, onDestroy, onRenderSecondary);
    Object.entries(callbackProps).forEach(([event, callback]) => {
      parentApi?.on(event, callback);
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
      parentApi?.frame.classList.remove(`footprint-${variant}-loading`);
      parentApi?.frame.classList.add(`footprint-${variant}-loaded`);
      return;
    }

    if (hasOverlay) {
      const overlay = createOverlay(container, id);
      createLoader(overlay, id);
    } else {
      createLoader(container, id);
    }
  };

  const setUpFormRefs = () => {
    if (!parentApi) {
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
        if (!parentApi) {
          throw new Error(
            'Footprint should be initialized to call ref methods',
          );
        }
        return new Promise(resolve => {
          parentApi?.call(PrivateEvent.formSaved);
          parentApi?.on(PrivateEvent.formSaveComplete, () => {
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

    isRendered = true;
    setLoading(container, true);

    const token = await sendSdkArgs(props);
    if (!token) {
      onDestroy();
      return;
    }

    const url = getURL(props, token || '');
    try {
      parentApi = await new Postmate({
        classListArray: [
          `footprint-${variant}`,
          `footprint-${variant}-loading`,
        ],
        container,
        name: `footprint-iframe-${id}`,
        url,
        allow:
          'otp-credentials; publickey-credentials-get *; camera *; clipboard-write;',
        model: {
          sdkVersion: version || '',
          sdkUrl: getWindowUrl(),
        },
      });
    } catch (e) {
      console.error('Initializing Footprint iframe failed with error: ', e);
      onDestroy();
      return;
    }

    setLoading(container, false);
    registerCallbackProps();
    parentApi?.on(PrivateEvent.started, () => {
      setUpFormRefs();
    });
  };

  // Only called from parent iframe manager, never to be called inside this iframe.ts file
  const destroy = async () => {
    if (!isRendered) {
      return;
    }
    isRendered = false;
    await removeDOMElements(id);
    if (parentApi) {
      parentApi.destroy();
      parentApi = null;
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
