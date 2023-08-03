import { RequiredCallbacksByComponent } from './constants/callbacks';
import { ComponentKind, Footprint, Props, Variant } from './types/components';
import { getAppearanceForVanilla } from './utils/appearance-utils';
import checkIsKindValid from './utils/check-is-kind-valid';
import {
  checkIsVariantValid,
  getDefaultVariantForKind,
} from './utils/variant-utils';

const defer = (callback: () => void) => {
  window.setTimeout(callback, 0);
};

const isObject = (obj: any) => typeof obj === 'object' && !!obj;

const vanillaIntegration = (footprint: Footprint) => {
  if (typeof window === 'undefined') return; // Don't do anything for SSR

  const getCallbacks = (kind: ComponentKind) => {
    const callbacks = window.footprintCallbacks ?? {};
    if (!isObject(callbacks)) {
      throw Error(
        '`window.footprintCallbacks` must be a valid mapping from callback names to functions.',
      );
    }

    // Make sure all expected callbacks for this component kind are provided
    const requiredCallbacks = RequiredCallbacksByComponent[kind];
    requiredCallbacks.forEach(callbackName => {
      if (!callbacks[callbackName]) {
        throw Error(
          `Callback '${callbackName}' must be defined in window.footprintCallbacks`,
        );
      }
    });

    return callbacks;
  };

  const renderComponent = (container: Element) => {
    const kind = container.getAttribute('data-kind') as ComponentKind;
    checkIsKindValid(kind);

    const variant =
      (container.getAttribute('data-variant') as Variant) ??
      getDefaultVariantForKind(kind);
    checkIsVariantValid(kind, variant);

    const appearance = getAppearanceForVanilla();
    const callbacks = getCallbacks(kind);

    const propsAttribute = container.getAttribute('data-props') || '';
    let props: Record<string, any>;
    try {
      props = JSON.parse(propsAttribute);
    } catch (_) {
      throw Error(`Could not parse \`data-props\` for footprint.`);
    }
    if (!isObject(props)) {
      throw Error(
        '`data-props` on the footprint element has to be a valid JSON object stringified.',
      );
    }
    const containerId = variant === 'inline' ? container.id : undefined;

    const addComponentToDom = () => {
      if (typeof window === 'undefined') return;

      const component = footprint.init({
        kind,
        variant,
        appearance,
        containerId,
        ...callbacks,
        ...props,
      } as Props);
      component.render();
    };

    defer(addComponentToDom);
  };

  const handlePageLoaded = () => {
    // Find and replace all footprint components
    const containers = document.querySelectorAll('[data-footprint]');
    if (!containers.length) {
      return;
    }

    containers.forEach(container => {
      renderComponent(container);
    });
  };

  document.addEventListener('DOMContentLoaded', () => handlePageLoaded());
};

export default vanillaIntegration;
