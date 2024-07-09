import { type DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { Checkbox, Divider, Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import CustomDocs from '../custom-docs';

const AdditionalDocuments = () => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.data-to-collect.additional-docs',
  });
  const { register } = useFormContext<DataToCollectFormData>();

  return (
    <Stack gap={4} direction="column">
      <Checkbox label={t('form.poa.label')} hint={t('form.poa.hint')} {...register('personal.additionalDocs.poa')} />
      <Checkbox
        label={t('form.possn.label')}
        hint={t('form.possn.hint')}
        {...register('personal.additionalDocs.possn')}
      />
      <Divider variant="secondary" />
      <CustomDocs />
    </Stack>
  );
};

export default AdditionalDocuments;
