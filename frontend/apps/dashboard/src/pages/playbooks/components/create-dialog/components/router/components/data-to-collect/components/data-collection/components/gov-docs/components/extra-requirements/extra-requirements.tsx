import { type DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { Box, Checkbox, Text } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const ExtraRequirements = () => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.data-to-collect.gov-docs.extra-requirements',
  });
  const { register } = useFormContext<DataToCollectFormData>();

  return (
    <>
      <Text variant="label-3">{t('title')}</Text>
      <Box paddingLeft={5}>
        <Checkbox label={t('selfie.title')} {...register('personal.docs.selfie')} />
      </Box>
    </>
  );
};

export default ExtraRequirements;
