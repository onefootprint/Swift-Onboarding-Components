import type uiResource from '../config/locales/en/ui.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'ui';
    fallbackNS: 'ui';
    resources: {
      ui: typeof uiResource;
    };
  }
}
