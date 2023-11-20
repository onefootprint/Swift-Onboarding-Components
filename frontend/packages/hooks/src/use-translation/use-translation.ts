import { useTranslation as useTranslationI18next } from 'react-i18next';

export type T = (key: string, options?: {}) => string;

const defaultOptions = { returnObjects: true };

const useTranslation = (namespace?: string) => {
  const { t: translate } = useTranslationI18next();

  const allT = (key: string, options = {}) =>
    translate(key, { ...options, ...defaultOptions });

  const t = (key: string, options = {}) =>
    namespace
      ? translate(`${namespace}.${key}`, { ...options, ...defaultOptions })
      : translate(key, { ...options, ...defaultOptions });

  return { t, allT };
};

export default useTranslation;
