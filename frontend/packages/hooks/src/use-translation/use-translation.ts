import { useTranslation as useTranslationI18next } from 'react-i18next';

const useTranslation = (namespace?: string) => {
  const { t: translate } = useTranslationI18next();
  const t = (key: string, extraData = {}) =>
    namespace
      ? translate(`${namespace}.${key}`, extraData)
      : translate(key, extraData);

  return { t };
};

export default useTranslation;
