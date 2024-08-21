import type { DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { Checkbox, Text } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const ExtraRequirements = () => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.gov-docs.extra-requirements',
  });
  const { register } = useFormContext<DataToCollectFormData>();

  return (
    <>
      <Text variant="label-3">{t('title')}</Text>
      <Checkbox label={t('selfie.title')} {...register('person.docs.gov.selfie')} />
    </>
  );
};

export default ExtraRequirements;
