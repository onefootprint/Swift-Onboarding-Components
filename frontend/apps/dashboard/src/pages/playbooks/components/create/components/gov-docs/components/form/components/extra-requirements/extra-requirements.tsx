import { Checkbox, Text } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { GovDocsFormData } from '../../../../gov-docs.types';

const ExtraRequirements = () => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.gov-docs.extra-requirements',
  });
  const { register } = useFormContext<GovDocsFormData>();

  return (
    <>
      <Text variant="label-3">{t('title')}</Text>
      <Checkbox label={t('selfie.title')} {...register('gov.selfie')} />
    </>
  );
};

export default ExtraRequirements;
