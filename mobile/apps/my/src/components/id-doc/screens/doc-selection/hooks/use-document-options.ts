import type { CountryRecord } from '@onefootprint/global-constants';
import {
  IcoCar24,
  IcoGreenCard24,
  IcoIdCard24,
  IcoPassport24,
  IcoPassportCard24,
  IcoVisaPassport24,
  IcoVoter24,
  IcoWork24,
} from '@onefootprint/icons';
import type { IdDocSupportedCountryAndDocTypes } from '@onefootprint/types';
import { SupportedIdDocTypes } from '@onefootprint/types';

import getSupportedCountryByCode from '@/components/id-doc/utils/get-supported-country-by-code';
import useTranslation from '@/hooks/use-translation';

const useDocumentOptions = (supportedCountryAndDocTypes: IdDocSupportedCountryAndDocTypes, country: CountryRecord) => {
  const { t } = useTranslation('scan.doc-selection');
  const availableDocTypes = getSupportedCountryByCode(supportedCountryAndDocTypes, country.value);
  const options = {
    [SupportedIdDocTypes.driversLicense]: {
      title: t('options.dl'),
      value: SupportedIdDocTypes.driversLicense,
      IconComponent: IcoCar24,
    },
    [SupportedIdDocTypes.idCard]: {
      title: t('options.id'),
      value: SupportedIdDocTypes.idCard,
      IconComponent: IcoIdCard24,
    },
    [SupportedIdDocTypes.passport]: {
      title: t('options.passport'),
      value: SupportedIdDocTypes.passport,
      IconComponent: IcoPassport24,
    },
    [SupportedIdDocTypes.visa]: {
      title: t('options.visa'),
      value: SupportedIdDocTypes.visa,
      IconComponent: IcoVisaPassport24,
    },
    [SupportedIdDocTypes.workPermit]: {
      title: t('options.permit'),
      value: SupportedIdDocTypes.workPermit,
      IconComponent: IcoWork24,
    },
    [SupportedIdDocTypes.residenceDocument]: {
      title: t('options.residence-document'),
      value: SupportedIdDocTypes.residenceDocument,
      IconComponent: IcoGreenCard24,
    },
    [SupportedIdDocTypes.voterIdentification]: {
      title: t('options.voter-identification'),
      value: SupportedIdDocTypes.voterIdentification,
      IconComponent: IcoVoter24,
    },
    [SupportedIdDocTypes.passportCard]: {
      title: t('options.passport-card'),
      value: SupportedIdDocTypes.passportCard,
      IconComponent: IcoPassportCard24,
    },
  };
  return availableDocTypes.map(type => options[type]).filter(option => option);
};

export default useDocumentOptions;
