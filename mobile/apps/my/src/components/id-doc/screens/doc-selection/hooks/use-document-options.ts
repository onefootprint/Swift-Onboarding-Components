import { CountryRecord } from '@onefootprint/global-constants';
import { IcoCar24, IcoIdCard24, IcoPassport24 } from '@onefootprint/icons';
import { IdDocType, SupportedIdDocTypes } from '@onefootprint/types';

import useTranslation from '@/hooks/use-translation';

import { getAvailableDocTypesByCountry } from '../utils/get-documents-by-country';

// get rid of this once back end fixes the typo with "drivers license" in id-doc type
const supportedTypeToIdDocType = {
  [SupportedIdDocTypes.idCard]: IdDocType.idCard,
  [SupportedIdDocTypes.driversLicense]: IdDocType.driversLicense,
  [SupportedIdDocTypes.passport]: IdDocType.passport,
};

const useDocumentOptions = (
  supportedDocumentTypes: SupportedIdDocTypes[],
  country: CountryRecord,
) => {
  const { t } = useTranslation('components.scan.doc-selection');
  // get rid of this conversion once back end fixes the typo with "drivers license" in id-doc type
  const supportedIdDocTypes: IdDocType[] = supportedDocumentTypes.map(
    supportedDocumentType => supportedTypeToIdDocType[supportedDocumentType],
  );
  const availableDocTypes: IdDocType[] = getAvailableDocTypesByCountry(
    country,
  ).filter(type => supportedIdDocTypes.includes(type));
  const options = {
    [IdDocType.driversLicense]: {
      title: t('options.dl.title'),
      description: t('options.dl.description'),
      value: IdDocType.driversLicense,
      IconComponent: IcoCar24,
    },
    [IdDocType.idCard]: {
      title: t('options.id.title'),
      description: t('options.id.description'),
      value: IdDocType.idCard,
      IconComponent: IcoIdCard24,
    },
    [IdDocType.passport]: {
      title: t('options.passport.title'),
      description: t('options.passport.description'),
      value: IdDocType.passport,
      IconComponent: IcoPassport24,
    },
  };
  return availableDocTypes.map(type => options[type]);
};

export default useDocumentOptions;
