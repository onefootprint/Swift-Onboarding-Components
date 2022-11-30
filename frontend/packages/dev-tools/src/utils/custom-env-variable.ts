import { IS_BROWSER, IS_PREVIEW } from '@onefootprint/global-constants';

const prefix = 'CUSTOM';

export const setCustomEnvVariable = (key: string, value: string) => {
  sessionStorage.setItem(`${prefix}_${key}`, value);
};

export const getCustomEnvVariable = (key: string, defaultValue?: string) => {
  if (IS_BROWSER && IS_PREVIEW) {
    const value = sessionStorage.getItem(`${prefix}_${key}`);
    if (value) {
      return value;
    }
  }
  return defaultValue || '';
};
