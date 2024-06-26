// @ts-nocheck

import { Box, Checkbox, Text } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const ExtraRequirements = () => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.data-to-collect.id-doc.sections.extra-requirements',
  });
  const { register } = useFormContext();

  return (
    <>
      <Text variant="label-3">{t('title')}</Text>
      <Box paddingLeft={5}>
        <Checkbox label={t('request-selfie')} {...register('personal.selfie')} />
      </Box>
    </>
  );
};

export default ExtraRequirements;
