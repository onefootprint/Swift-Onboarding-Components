import Postmate from '@onefootprint/postmate';

import {
  FootprintComponentKind,
  FootprintComponentProps,
  FootprintComponentsEvent,
  SecureFormProps,
} from '../types';
import {
  createInlineLoaderContainer,
  createLoader,
  createModalContainer,
  createOverlay,
  removeInlineLoaderContainer,
  removeLoader,
  removeOverlay,
} from './ui-utils';

class FootprintComponentsIframe {
  private child: Postmate.ParentAPI | null = null;

  private sendProps(props?: FootprintComponentProps) {
    if (props) {
      this.child?.call(FootprintComponentsEvent.propsReceived, props);
    }
  }

  private showLoading(
    container: HTMLElement,
    isModal: boolean,
    isLoading: boolean,
  ) {
    if (isLoading) {
      if (isModal) {
        const overlay = createOverlay(container);
        createLoader(overlay);
      } else {
        const inlineContainer = createInlineLoaderContainer(container);
        createLoader(inlineContainer);
      }
    } else if (isModal) {
      removeLoader();
      this.child?.frame.classList.remove('footprint-components-modal-loading');
      this.child?.frame.classList.add('footprint-components-modal-loaded');
    } else {
      removeInlineLoaderContainer();
    }
  }

  private isModal(
    kind: FootprintComponentKind,
    props: FootprintComponentProps,
  ) {
    if (kind === FootprintComponentKind.SecureForm) {
      const formProps = props as SecureFormProps;
      return formProps?.variant === 'modal';
    }
    return false;
  }

  private getOrCreateContainer(isModal: boolean, containerId: string) {
    // If rendering in a modal, need to create a new container, otherwise use the containerId passed in
    let container;
    if (isModal) {
      container = createModalContainer();
    } else {
      container = document.getElementById(containerId);
      if (!container) {
        throw new Error(
          'A valid containerId is required to create a Footprint button',
        );
      }
    }
    return container;
  }

  private getIframeClassList(isModal: boolean) {
    const classList = [];
    if (isModal) {
      classList.push(
        'footprint-components-modal',
        'footprint-components-modal-loading',
      );
    } else {
      classList.push('footprint-components-inline');
    }

    return classList;
  }

  async render(
    url: string,
    kind: FootprintComponentKind,
    props: FootprintComponentProps,
    containerId: string,
  ) {
    const isModal = this.isModal(kind, props);
    const container = this.getOrCreateContainer(isModal, containerId);
    if (!container) {
      return;
    }
    if (container.hasChildNodes()) {
      this.destroy();
      container.innerHTML = '';
    }

    this.showLoading(container, isModal, true);
    this.child = await new Postmate({
      classListArray: this.getIframeClassList(isModal),
      container,
      name: 'footprint-iframe',
      url,
      allow: 'otp-credentials;',
    });
    this.showLoading(container, isModal, false);

    this.child.on(FootprintComponentsEvent.started, () => {
      this.sendProps(props);
    });
  }

  on(eventName: string, callback: (data?: any) => void) {
    if (!this.child) {
      throw new Error('Footprint should be open in order to listen events');
    }
    return this.child.on(eventName, callback);
  }

  destroy() {
    removeOverlay();
    removeInlineLoaderContainer();
    if (this.child) {
      this.child.destroy();
    }
  }
}

export default FootprintComponentsIframe;
