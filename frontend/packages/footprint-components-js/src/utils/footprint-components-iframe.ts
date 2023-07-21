import Postmate from '@onefootprint/postmate';

import {
  FootprintComponentKind,
  FootprintComponentProps,
  FootprintComponentsEvent,
  SecureFormProps,
} from '../types';
import {
  createInlineContainer,
  createLoader,
  createOverlay,
  createOverlayContainer,
  removeInlineContainer,
  removeLoader,
  removeOverlay,
} from './ui-utils';

type ContainerVariant = 'modal' | 'inline' | 'drawer';

class FootprintComponentsIframe {
  private child: Postmate.ParentAPI | null = null;

  private sendProps(
    kind: FootprintComponentKind,
    props?: FootprintComponentProps,
  ) {
    if (!props) {
      return;
    }
    // We need to omit appearance and callback props from the props sent to the iframe
    // Functions cannot be sent via post message and apperaance is already sent via URL
    if (kind === FootprintComponentKind.SecureForm) {
      const { onClose, onSave, onCancel, appearance, ...rest } =
        props as SecureFormProps;
      this.child?.call(FootprintComponentsEvent.propsReceived, rest);
    } else if (kind === FootprintComponentKind.SecureRender) {
      const { appearance, ...rest } = props;
      this.child?.call(FootprintComponentsEvent.propsReceived, rest);
    }
  }

  private showLoading(
    container: HTMLElement,
    variant: ContainerVariant,
    isLoading: boolean,
  ) {
    const hasOverlay = variant === 'modal' || variant === 'drawer';

    if (isLoading) {
      if (hasOverlay) {
        const overlay = createOverlay(container);
        createLoader(overlay);
      } else {
        createLoader(container);
      }
      return;
    }

    removeLoader();
    this.child?.frame.classList.remove(
      `footprint-components-${variant}-loading`,
    );
    this.child?.frame.classList.add(`footprint-components-${variant}-loaded`);
  }

  private getContainerVariant(
    kind: FootprintComponentKind,
    props: FootprintComponentProps,
  ) {
    if (kind !== FootprintComponentKind.SecureForm) {
      return 'inline';
    }
    const formProps = props as SecureFormProps;
    if (formProps.variant === 'drawer') {
      return 'drawer';
    }
    if (formProps.variant === 'card') {
      return 'inline';
    }
    if (formProps.variant === 'modal') {
      return 'modal';
    }

    // Default to modal if no variant is passed
    return 'modal';
  }

  private getOrCreateContainer(variant: ContainerVariant, containerId: string) {
    // If rendering in a modal, need to create a new container, otherwise use the containerId passed in
    let container;
    const hasOverlay = variant === 'modal' || variant === 'drawer';
    if (hasOverlay) {
      container = createOverlayContainer();
    } else {
      const clientContainer = document.getElementById(containerId);
      if (!clientContainer) {
        throw new Error(
          'A valid containerId is required to create a Footprint button',
        );
      }
      container = createInlineContainer(clientContainer);
    }
    return container;
  }

  // We keep these class names wordy to avoid collisions with other
  // footprint integrations on the same page
  private getIframeClassList(variant: ContainerVariant) {
    return [
      `footprint-components-${variant}`,
      `footprint-components-${variant}-loading`,
    ];
  }

  async render(
    url: string,
    kind: FootprintComponentKind,
    props: FootprintComponentProps,
    containerId: string,
  ) {
    const variant = this.getContainerVariant(kind, props);
    const container = this.getOrCreateContainer(variant, containerId);
    if (!container) {
      return;
    }
    if (container.hasChildNodes()) {
      this.destroy();
      container.innerHTML = '';
    }

    this.showLoading(container, variant, true);
    this.child = await new Postmate({
      classListArray: this.getIframeClassList(variant),
      container,
      name: 'footprint-iframe',
      url,
      allow: 'otp-credentials;',
    });
    this.showLoading(container, variant, false);

    this.child.on(FootprintComponentsEvent.started, () => {
      this.sendProps(kind, props);
    });
  }

  on(eventName: string, callback: (data?: any) => void) {
    if (!this.child) {
      throw new Error(
        'Footprint components should be open in order to listen events',
      );
    }
    return this.child.on(eventName, callback);
  }

  destroy() {
    removeOverlay();
    removeInlineContainer();
    if (this.child) {
      this.child.destroy();
    }
  }
}

export default FootprintComponentsIframe;
