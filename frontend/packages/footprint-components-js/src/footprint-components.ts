import './footprint-components-styles.css';

import {
  FootprintComponentKind,
  FootprintComponentProps,
  FootprintComponentRenderProps,
  SecureFormEvent,
  SecureFormProps,
} from './types';
import IframeManager from './utils/footprint-components-iframe';
import { getAppearanceStyles, getURL } from './utils/url-utils';

const initFootprintComponent = () => {
  const iframeManager = new IframeManager();
  let hasIframeOpened = false;

  const registerEvents = (
    kind: FootprintComponentKind,
    props: FootprintComponentProps,
  ) => {
    if (kind === FootprintComponentKind.SecureForm) {
      const { onClose, onSave, onCancel } = props as SecureFormProps;
      if (onClose) {
        iframeManager.on(SecureFormEvent.secureFormClosed, onClose);
      }
      if (onCancel) {
        iframeManager.on(SecureFormEvent.secureFormCanceled, onCancel);
      }
      if (onSave) {
        iframeManager.on(SecureFormEvent.secureFormSaved, onSave);
      }
    }
  };

  const render = async ({
    kind,
    props,
    containerId,
  }: FootprintComponentRenderProps) => {
    if (hasIframeOpened) {
      return;
    }
    hasIframeOpened = true;

    const { appearance } = props;
    const { fontSrc, rules, variables } = getAppearanceStyles(appearance);
    const url = getURL(kind, { fontSrc, rules, variables });
    await iframeManager.render(url, kind, props, containerId);
    registerEvents(kind, props);
  };

  const destroy = async () => {
    iframeManager.destroy();
    hasIframeOpened = false;
  };

  return {
    render,
    destroy,
  };
};

export default initFootprintComponent;
