import { CountryRecord } from '@onefootprint/global-constants';
import { IcoCar24, IcoIdCard24, IcoPassport24 } from '@onefootprint/icons';
import { SupportedIdDocTypes } from '@onefootprint/types';

import useTranslation from '@/hooks/use-translation';

import { getAvailableDocTypesByCountry } from '../utils/get-documents-by-country';

const useDocumentOptions = (
  supportedDocumentTypes: SupportedIdDocTypes[],
  country: CountryRecord,
) => {
  const { t } = useTranslation('components.scan.doc-selection');
  const availableDocTypes: SupportedIdDocTypes[] =
    getAvailableDocTypesByCountry(country).filter(type =>
      supportedDocumentTypes.includes(type),
    );
  const options = {
    [SupportedIdDocTypes.driversLicense]: {
      title: t('options.dl.title'),
      description: t('options.dl.description'),
      value: SupportedIdDocTypes.driversLicense,
      IconComponent: IcoCar24,
    },
    [SupportedIdDocTypes.idCard]: {
      title: t('options.id.title'),
      description: t('options.id.description'),
      value: SupportedIdDocTypes.idCard,
      IconComponent: IcoIdCard24,
    },
    [SupportedIdDocTypes.passport]: {
      title: t('options.passport.title'),
      description: t('options.passport.description'),
      value: SupportedIdDocTypes.passport,
      IconComponent: IcoPassport24,
    },
  };
  return availableDocTypes.map(type => options[type]);
};

export default useDocumentOptions;
