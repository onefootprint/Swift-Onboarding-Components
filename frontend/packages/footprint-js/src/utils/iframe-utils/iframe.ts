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
import type { Iframe } from './types';

type Child = Postmate.ParentAPI;
type OnDestroy = () => void;
type OnRenderSecondary = (secondaryProps: Props) => void;
type RegisterEvent = Iframe['registerEvent'];

export const registerCallbackProps = (
  child: Child | null,
  props: Props,
  onDestroy?: OnDestroy,
  onRenderSecondary?: OnRenderSecondary,
): Child | never => {
  if (!child) {
    throw new Error(
      'Footprint should be initialized in order to listen events',
    );
  }

  const callbackProps = getCallbackProps(props, onDestroy, onRenderSecondary);
  Object.entries(callbackProps).forEach(([event, callback]) => {
    child?.on(event, callback);
  });

  return child;
};

export const setUpFormRefs = (
  child: Child | null,
  props: Props,
): never | void => {
  if (!child) {
    throw new Error('Footprint should be initialized in order to set up refs');
  }
  // For now we only support refs on the form component
  const { kind } = props;
  if (kind !== ComponentKind.Form) {
    return;
  }

  const { getRef } = props;
  if (!getRef) {
    return;
  }

  const formRef: FormRef = {
    save: () => {
      if (!child) {
        throw new Error('Footprint should be initialized to call ref methods');
      }
      return new Promise(resolve => {
        child?.call(PrivateEvent.formSaved);
        child?.on(PrivateEvent.formSaveComplete, () => {
          resolve();
        });
      });
    },
  };
  getRef(formRef);
};

export const sendDataProps = (child: Child | null, props: Props): void => {
  if (!child) {
    throw new Error(
      'Footprint should be initialized in order to receive props',
    );
  }
  const dataProps = omitCallbacksAndRefs(props);
  child.call(PrivateEvent.propsReceived, dataProps);
};

const getOrCreateContainer = (
  { variant, containerId }: Props,
  id: string,
): HTMLElement | null => {
  const hasOverlay = variant === 'modal' || variant === 'drawer';
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

const setLoading = (
  child: Child | null,
  { variant }: Props,
  id: string,
  container: HTMLElement,
  isLoading?: boolean,
) => {
  const hasOverlay = variant === 'modal' || variant === 'drawer';
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

const initIframe = (rawProps: Props): Iframe => {
  let child: Child | null = null;
  let isRendered = false;
  let onDestroy: OnDestroy;
  let onRenderSecondary: OnRenderSecondary;
  const props = sanitizeAndValidateProps(rawProps);
  const { variant } = props;
  const id = getUniqueId();

  const render = async () => {
    if (isRendered) {
      return;
    }
    const container = getOrCreateContainer(props, id);
    if (!container) {
      return;
    }
    if (container.hasChildNodes()) {
      container.innerHTML = '';
    }

    const url = getURL(props);
    isRendered = true;

    setLoading(child, props, id, container, true);
    child = await new Postmate({
      classListArray: [`footprint-${variant}`, `footprint-${variant}-loading`],
      container,
      name: `footprint-iframe-${id}`,
      url,
      allow:
        'otp-credentials; publickey-credentials-get *; camera *; clipboard-write;',
    });
    setLoading(child, props, id, container, false);

    child = registerCallbackProps(child, props, onDestroy, onRenderSecondary);
    child.on(PrivateEvent.started, () => {
      sendDataProps(child, props);
      setUpFormRefs(child, props);
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

  const registerEvent: RegisterEvent = (event, callback) => {
    if (!callback || typeof callback !== 'function') return;

    if (event === 'renderSecondary') {
      onRenderSecondary = callback;
    } else if (event === 'destroy') {
      onDestroy = callback as OnDestroy;
    }
  };

  return {
    props,
    isRendered,
    render,
    destroy,
    registerEvent,
  };
};

export default initIframe;
