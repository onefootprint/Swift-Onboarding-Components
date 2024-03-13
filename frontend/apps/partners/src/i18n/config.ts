export type Langs = 'en' | 'es';
export type Namespaces = 'common';

export const LangFallback = 'en';
export const LangsSupported = [LangFallback, 'es'];

export const i18nConfig = {
  locales: LangsSupported,
  defaultLocale: LangFallback,
};
