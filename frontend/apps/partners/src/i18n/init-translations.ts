import { createInstance } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next/initReactI18next';

import type { Langs, Namespaces } from '@/i18n/config';
import { i18nConfig } from '@/i18n/config';

type I18nInstance = ReturnType<typeof createInstance>;
type InitProps = Parameters<I18nInstance['init']>[0];

const initTranslations = async (
  locale: Langs,
  namespaces: Namespaces[],
  i18nInstance?: I18nInstance,
  resources?: InitProps['resources'],
) => {
  const instance = i18nInstance || createInstance();
  instance.use(initReactI18next);

  if (!resources) {
    instance.use(
      resourcesToBackend(
        (language: string, namespace: string) => import(`@/config/locales/${language}/${namespace}.json`),
      ),
    );
  }

  await instance.init({
    defaultNS: namespaces[0],
    fallbackLng: i18nConfig.defaultLocale,
    fallbackNS: namespaces[0],
    lng: locale,
    ns: namespaces,
    preload: resources ? [] : i18nConfig.locales,
    resources,
    supportedLngs: i18nConfig.locales,
  });

  return {
    i18n: instance,
    resources: instance.services.resourceStore.data,
    t: instance.t,
  };
};

export default initTranslations;
