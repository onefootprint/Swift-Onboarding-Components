import { CountryRecord } from '@onefootprint/global-constants';
import {
  IcoCar24,
  IcoGreenCard24,
  IcoIdCard24,
  IcoPassport24,
  IcoVisaPassport24,
  IcoWork24,
} from '@onefootprint/icons';
import {
  IdDocSupportedCountryAndDocTypes,
  SupportedIdDocTypes,
} from '@onefootprint/types';

import useTranslation from '@/hooks/use-translation';

const useDocumentOptions = (
  supportedCountryAndDocTypes: IdDocSupportedCountryAndDocTypes,
  country: CountryRecord,
) => {
  const { t } = useTranslation('components.scan.doc-selection');
  const availableDocTypes = supportedCountryAndDocTypes[country.value];
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
    [SupportedIdDocTypes.visa]: {
      title: t('options.visa.title'),
      description: t('options.visa.description'),
      value: SupportedIdDocTypes.visa,
      IconComponent: IcoVisaPassport24,
    },
    [SupportedIdDocTypes.workPermit]: {
      title: t('options.work-permit.title'),
      description: t('options.work-permit.description'),
      value: SupportedIdDocTypes.workPermit,
      IconComponent: IcoWork24,
    },
    [SupportedIdDocTypes.residenceDocument]: {
      title: t('options.residence-document.title'),
      description: t('options.residence-document.description'),
      value: SupportedIdDocTypes.residenceDocument,
      IconComponent: IcoGreenCard24,
    },
  };
  return availableDocTypes.map(type => options[type]);
};

export default useDocumentOptions;
