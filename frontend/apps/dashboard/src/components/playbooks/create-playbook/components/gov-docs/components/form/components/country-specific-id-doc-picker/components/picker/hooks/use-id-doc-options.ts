import type { IdDocKind } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';

type IdDocOption = {
  value: IdDocKind;
  label: string;
};

const useIdDocOptions = (): IdDocOption[] => {
  const { t } = useTranslation('common', { keyPrefix: 'id_document' });
  return [
    {
      value: 'drivers_license',
      label: t('drivers_license'),
    },
    {
      value: 'passport',
      label: t('passport'),
    },
    {
      value: 'passport_card',
      label: t('passport_card'),
    },
    {
      value: 'id_card',
      label: t('id_card'),
    },
    {
      value: 'residence_document',
      label: t('residence_document'),
    },
    {
      value: 'permit',
      label: t('permit'),
    },
    {
      value: 'visa',
      label: t('visa'),
    },
    {
      value: 'voter_identification',
      label: t('voter_identification'),
    },
  ];
};

export default useIdDocOptions;
