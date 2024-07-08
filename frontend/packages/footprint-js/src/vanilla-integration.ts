import type { Window } from './@types/global';
import { RequiredCallbacksByComponent } from './constants/callbacks';
import type { ComponentKind, Footprint, Props, Variant } from './types/components';
import { getAppearanceForVanilla } from './utils/appearance-utils';
import getUniqueId from './utils/get-unique-id';
import { getDefaultVariantForKind, validateComponentKind, validateComponentVariant } from './utils/prop-utils';
import { isObject } from './utils/prop-utils';

const defer = (callback: () => void) => {
  window.setTimeout(callback, 0);
};

const vanillaIntegration = (footprint: Footprint) => {
  if (typeof window === 'undefined') return; // Don't do anything for SSR

  const getCallbacks = (kind: ComponentKind) => {
    const callbacks = (window as Window).footprintCallbacks ?? {};
    if (!isObject(callbacks)) {
      throw Error('`window.footprintCallbacks` must be a valid mapping from callback names to functions.');
    }

    // Make sure all expected callbacks for this component kind are provided
    const requiredCallbacks = RequiredCallbacksByComponent[kind];
    requiredCallbacks.forEach(callbackName => {
      if (!callbacks[callbackName]) {
        throw Error(`Callback '${callbackName}' must be defined in window.footprintCallbacks`);
      }
    });

    return callbacks;
  };

  const renderComponent = (container: HTMLElement) => {
    const kind = container.getAttribute('data-kind') as ComponentKind;
    validateComponentKind(kind);

    const variant = (container.getAttribute('data-variant') as Variant) ?? getDefaultVariantForKind(kind);
    validateComponentVariant(kind, variant);

    const appearance = getAppearanceForVanilla();
    const callbacks = getCallbacks(kind);

    const propsAttribute = container.getAttribute('data-props') || '';
    let props: Record<string, unknown>;
    try {
      props = JSON.parse(propsAttribute);
    } catch (_) {
      throw Error(`Could not parse \`data-props\` for footprint.`);
    }
    if (!isObject(props)) {
      throw Error('`data-props` on the footprint element has to be a valid JSON object stringified.');
    }
    const containerId = getUniqueId();
    container.setAttribute('id', containerId);

    const component = footprint.init({
      kind,
      variant,
      appearance,
      containerId: container.id,
      ...callbacks,
      ...props,
    } as Props);
    component.render();
  };

  const handlePageLoaded = () => {
    // Find and replace all footprint components
    const containers = document.querySelectorAll('[data-footprint]');
    if (!containers.length) {
      return;
    }
    containers.forEach(container => {
      renderComponent(container as HTMLElement);
    });
  };

  // Render the component when the page is loaded
  // If the page is loaded dynamically, DOMContentLoaded will fire
  // before the page content is fully loaded, so also listen for readyState instead
  document.addEventListener('DOMContentLoaded', () => defer(handlePageLoaded));
  // TODO: alternative to DOMContentLoaded for SSR
  // if (document.readyState === 'complete') {
  //   defer(handlePageLoaded);
  // } else {
  //   document.onreadystatechange = () => {
  //     if (document.readyState === 'complete') {
  //       defer(handlePageLoaded);
  //     }
  //   };
  // }
};

export default vanillaIntegration;
