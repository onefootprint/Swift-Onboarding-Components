import { useTranslation as useTranslationI18next } from 'react-i18next';

const defaultOptions = { returnObjects: true };

const useTranslation = (namespace?: string) => {
  const { t: translate } = useTranslationI18next();
  const t = (key: string, options = {}) =>
    namespace
      ? translate(`${namespace}.${key}`, { ...options, ...defaultOptions })
      : translate(key, { ...options, ...defaultOptions });

  return { t, allT: translate };
};

export default useTranslation;
