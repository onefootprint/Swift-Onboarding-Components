import Postmate from '@onefootprint/postmate';

import { version } from '../../../package.json';
import type { FormRef, Props } from '../../types/components';
import { ComponentKind } from '../../types/components';
import { PrivateEvent, PublicEvent } from '../../types/events';
import {
  createErrorModal,
  createInlineContainer,
  createLoader,
  createOverlay,
  createOverlayContainer,
  hideContainer,
  removeDOMElements,
  removeLoader,
  showContainer,
} from '../dom-utils';
import getUniqueId from '../get-unique-id';
import { logError, logWarn } from '../logger';
import { getCallbackProps, sanitizeAndValidateProps } from '../prop-utils';
import { SdkKindByComponentKind } from '../request-utils/constants';
import sendSdkArgs from '../request-utils/send-sdk-args';
import getURL, { getWindowUrl } from '../url-utils';
import type { Iframe, OnDestroy, OnRenderSecondary } from './types';

type ParentApi = Postmate.ParentAPI;

const initIframe = (rawProps: Props): Iframe => {
  let parentApi: ParentApi | null = null;
  let isRendered = false;
  let onDestroy: OnDestroy;
  let onRenderSecondary: OnRenderSecondary;
  const { formSaveComplete, formSaved, formSaveFailed, started } = PrivateEvent;
  const props = sanitizeAndValidateProps(rawProps);
  const { variant, containerId } = props;
  const hasOverlay = variant === 'modal' || variant === 'drawer';
  const initId = getUniqueId();

  const handleError = (error: string, shouldDestroy?: boolean) => {
    const errorMessage = logError(SdkKindByComponentKind[props.kind], error);
    props.onError?.(errorMessage);
    if (isRendered && shouldDestroy) {
      onDestroy();
      isRendered = false;
    }
  };

  const registerCallbackProps = () => {
    if (!parentApi) {
      handleError('Footprint should be initialized in order to register callback props');
      return;
    }

    const callbackProps = getCallbackProps(props, onDestroy, onRenderSecondary);
    Object.entries(callbackProps).forEach(([event, callback]) => {
      parentApi?.on(event, callback);
      parentApi?.on(`${initId}:${event}`, callback);
    });
  };

  const getOrCreateContainer = (): HTMLElement | undefined => {
    if (hasOverlay) {
      return createOverlayContainer(initId);
    }
    if (!containerId) {
      handleError('containerId is required when rendering inline');
      return undefined;
    }

    // If rendering inline, find the client parent div
    const clientParent = document.getElementById(containerId);
    if (!clientParent) {
      handleError(`Could not find container with id ${containerId} while rendering footprint`);
      return undefined;
    }
    return createInlineContainer(initId, clientParent);
  };

  const setLoading = (container: HTMLElement, isLoading: boolean) => {
    if (!isLoading) {
      removeLoader(initId);
      parentApi?.frame.classList.remove('fp-hide');
      parentApi?.frame.classList.remove(`footprint-${variant}-loading`);
      parentApi?.frame.classList.add(`footprint-${variant}-loaded`);
      return;
    }

    if (hasOverlay) {
      const overlay = createOverlay(container, initId);
      createLoader(overlay, initId);
    } else {
      createLoader(container, initId);
    }
  };

  const setUpFormRefs = () => {
    if (!parentApi) {
      handleError('Footprint should be initialized in order to set up refs');
      return;
    }
    // For now we only support refs on the form component
    if (props.kind !== ComponentKind.Form || !props.getRef) {
      return;
    }

    const formRef: FormRef = {
      save: () => {
        if (!parentApi) {
          handleError('Footprint should be initialized to call ref methods');
        }
        return new Promise((resolve, reject) => {
          // Make sure to first register the callbacks before triggering save
          parentApi?.on(formSaveComplete, () => {
            resolve();
          });
          parentApi?.on(formSaveFailed, (error: string) => {
            reject(error);
          });

          parentApi?.on(`${initId}:${formSaveComplete}`, resolve);
          parentApi?.on(`${initId}:${formSaveFailed}`, reject);

          parentApi?.call(formSaved);
        });
      },
    };
    props.getRef?.(formRef);
  };

  const render = async () => {
    if (isRendered) {
      logWarn(SdkKindByComponentKind[props.kind], 'Footprint component is already rendered');
      return;
    }
    const container = getOrCreateContainer();
    if (!container) {
      logWarn(SdkKindByComponentKind[props.kind], 'Unable to create container for Footprint component');
      return;
    }
    if (container.hasChildNodes()) {
      container.innerHTML = '';
    }

    isRendered = true;
    setLoading(container, true);

    const sdkArgsToken = await sendSdkArgs(props);
    if (!sdkArgsToken) {
      handleError('Unable to get SDK args token.', true);
      return;
    }

    const url = getURL(props, sdkArgsToken || '');
    try {
      parentApi = await new Postmate({
        classListArray: [`footprint-${variant}`, `footprint-${variant}-loading`, 'fp-hide'],
        container,
        name: `footprint-iframe-${initId}`,
        url,
        allow: 'otp-credentials; publickey-credentials-get *; camera *; clipboard-write;',
        model: {
          authToken: props.authToken,
          initId,
          sdkUrl: getWindowUrl(),
          sdkVersion: version || '',
        },
      });
    } catch (e) {
      createErrorModal(container);
      handleError(`Initializing iframe failed with error ${e}`);
      return;
    }

    setLoading(container, false);
    registerCallbackProps();
    parentApi?.on(started, () => setUpFormRefs());
    parentApi?.on(`${initId}:${started}`, setUpFormRefs);

    // For the components SDK, we should hide the iframe as soon as it hands off to us
    if (props.kind === ComponentKind.Components) {
      parentApi?.on(`${initId}:${PublicEvent.relayToComponents}`, () => {
        hideContainer(initId);
      });
    }
  };

  // Only called from parent iframe manager, never to be called inside this iframe.ts file
  const destroy = async () => {
    if (!isRendered) {
      return;
    }
    isRendered = false;
    await removeDOMElements(initId);
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

  const relayFromComponents = () => {
    if (parentApi) {
      parentApi.call(PrivateEvent.relayFromComponents);
      showContainer(initId);
    }
  };

  return {
    relayFromComponents,
    props,
    isRendered,
    render,
    destroy,
    registerOnDestroy,
    registerOnRenderSecondary,
  };
};

export default initIframe;
