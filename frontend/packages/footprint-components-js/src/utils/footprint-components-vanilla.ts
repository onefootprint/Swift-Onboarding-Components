import {
  FootprintComponent,
  FootprintComponentKind,
  FootprintComponentProps,
} from '../types';

const defer = (callback: () => void) => {
  window.setTimeout(callback, 0);
};

const isObject = (obj: any) => typeof obj === 'object' && !!obj;

const vanillaIntegration = (footprintComponent: FootprintComponent) => {
  if (typeof window === 'undefined') return; // Don't do anything for SSR

  const getAppearance = () => {
    const appearance = window.footprintComponentsAppearance;
    if (!appearance || !isObject(appearance)) {
      return undefined;
    }
    return {
      fontSrc: appearance.fontSrc,
      rules: appearance.rules,
      theme: appearance.theme,
      variables: appearance.variables,
    };
  };

  const getCallbacks = () => {
    const callbacks = window.footprintComponentsCallbacks;
    if (!callbacks) {
      return {};
    }
    if (!isObject(callbacks)) {
      throw Error(
        '`window.footprintComponentsCallbacks` must be a valid mapping from callback names to functions.',
      );
    }
    return callbacks;
  };

  const handlePageLoaded = () => {
    const container = document.getElementById('footprint-component');
    if (!container) {
      return;
    }

    const kind = container.getAttribute('data-kind') as
      | FootprintComponentKind
      | undefined;
    if (!kind) {
      throw Error(
        'Component kind must be passed as `data-kind` in the #footprint-component element',
      );
    }
    if (!kind || Object.values(FootprintComponentKind).indexOf(kind) === -1) {
      throw Error(
        `Invalid component kind: ${kind}. Must be one of ${Object.values(
          FootprintComponentKind,
        ).join(', ')}`,
      );
    }

    const propsAttribute = container.getAttribute('data-props') ?? '';
    let props: FootprintComponentProps;
    try {
      props = JSON.parse(propsAttribute);
    } catch (_) {
      // eslint-disable-next-line no-console
      throw Error(
        `Could not parse \`data-props\` in the #footprint-component element.`,
      );
    }
    if (!isObject(props)) {
      throw Error(
        '`data-props` in the #footprint-component element has to be a valid JSON object stringified.',
      );
    }

    // We must have a unique containerId in case there are multiple components on the same page
    const randomSeed = Math.floor(Math.random() * 1000);
    const containerId = `footprint-component-${kind}-${randomSeed}`;

    const createComponent = () => {
      if (typeof window === 'undefined') return;
      container.id = containerId;

      footprintComponent.render({
        kind,
        props: {
          ...props,
          ...getCallbacks(),
          appearance: getAppearance(),
        },
        containerId,
      });
    };

    defer(createComponent);
  };

  document.addEventListener('DOMContentLoaded', () => handlePageLoaded());
};

export default vanillaIntegration;
