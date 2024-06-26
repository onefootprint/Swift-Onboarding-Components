// @ts-nocheck

import type { CountryRecord } from '@onefootprint/global-constants';
import { SupportedIdDocTypes } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';

const useIdDocOptions = (country: CountryRecord) => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.data-to-collect.id-doc',
  });
  const options = [];
  if (country.driversLicense) {
    options.push({
      value: SupportedIdDocTypes.driversLicense,
      label: t('drivers_license'),
    });
  }
  if (country.passport) {
    options.push({
      value: SupportedIdDocTypes.passport,
      label: t('passport'),
    });
  }
  if (country.passportCard) {
    options.push({
      value: SupportedIdDocTypes.passportCard,
      label: t('passport_card'),
    });
  }
  if (country.idCard) {
    options.push({
      value: SupportedIdDocTypes.idCard,
      label: t('id_card'),
    });
  }
  if (country.residenceDocument) {
    options.push({
      value: SupportedIdDocTypes.residenceDocument,
      label: t('residence_document'),
    });
  }
  if (country.workPermit) {
    options.push({
      value: SupportedIdDocTypes.workPermit,
      label: t('permit'),
    });
  }
  if (country.visa) {
    options.push({
      value: SupportedIdDocTypes.visa,
      label: t('visa'),
    });
  }
  if (country.voterIdentification) {
    options.push({
      value: SupportedIdDocTypes.voterIdentification,
      label: t('voter_identification'),
    });
  }

  return options;
};

export default useIdDocOptions;
