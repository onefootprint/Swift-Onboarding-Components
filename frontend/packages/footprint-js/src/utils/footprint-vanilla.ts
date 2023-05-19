import type { Footprint } from '../footprint-js.types';
import { USER_DATA_KEYS, UserData } from '../footprint-js.types';
import { createButton } from './footprint-ui';

const defer = (callback: () => void) => {
  window.setTimeout(callback, 0);
};

const isFunction = (fn: any) => typeof fn === 'function';

const isObject = (obj: any) => typeof obj === 'object' && !!obj;

const startVanillaIntegration = (footprint: Footprint) => {
  if (typeof window === 'undefined') return;

  const getAppearance = () => {
    const appearance = window.footprintAppearance;
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

  const handleButtonClicked = (publicKey: string, container: HTMLElement) => {
    const userData: UserData = {};
    USER_DATA_KEYS.forEach(key => {
      const val = container.getAttribute(`data-user-${key}`);
      if (val) {
        userData[key as keyof UserData] = val;
      }
    });

    footprint.open({
      publicKey,
      appearance: getAppearance(),
      onCanceled: () => {
        if (isFunction(window.onFootprintCanceled)) {
          window.onFootprintCanceled?.();
        }
      },
      onCompleted: (validationToken: string) => {
        if (isFunction(window.onFootprintCompleted)) {
          window.onFootprintCompleted?.(validationToken);
        }
      },
      userData,
    });
  };

  const handlePageLoaded = () => {
    const container = document.getElementById('footprint-button');
    if (!container) {
      return;
    }
    const publicKey = container.getAttribute('data-public-key');
    if (!publicKey) {
      throw Error(
        'A public key must be passed as `data-public-key` in the #footprint-button element',
      );
    }
    initFootprint(publicKey, container);
  };

  const initFootprint = (publicKey: string, container: HTMLElement) => {
    const createButtonAndListen = () => {
      const button = createButton(container);
      button.addEventListener('click', () => {
        handleButtonClicked(publicKey, container);
      });
    };
    defer(createButtonAndListen);
  };

  document.addEventListener('DOMContentLoaded', () => handlePageLoaded());
};

export default startVanillaIntegration;
