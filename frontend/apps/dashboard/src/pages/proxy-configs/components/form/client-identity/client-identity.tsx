import { useTranslation } from '@onefootprint/hooks';
import { IcoFileText224, IcoKey24 } from '@onefootprint/icons';
import { Box, Divider, TextArea, Typography } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import type {
  FormData,
  StepProps,
} from 'src/pages/proxy-configs/proxy-configs.types';

import UploadFile from '../upload-file';

const ClientIdentity = ({ id, onSubmit, values }: StepProps) => {
  const { t } = useTranslation(
    'pages.proxy-configs.create.form.client-identity',
  );
  const { handleSubmit, register, setValue } = useForm<FormData>({
    defaultValues: {
      clientIdentity: values.clientIdentity,
    },
  });

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="label-2" sx={{ marginBottom: 5 }}>
        {t('title')}
      </Typography>
      <UploadFile
        accept=".pem, .crt"
        cta={t('certificate.cta')}
        iconComponent={IcoFileText224}
        id="certificate"
        label={t('certificate.label')}
        onChange={value => setValue('clientIdentity.certificate', value)}
      >
        <TextArea
          autoFocus
          placeholder={t('certificate.placeholder')}
          id="certificate"
          {...register('clientIdentity.certificate')}
        />
      </UploadFile>
      <Box marginBottom={7} marginTop={7}>
        <Divider />
      </Box>
      <UploadFile
        accept=".key"
        cta={t('key.cta')}
        iconComponent={IcoKey24}
        id="key"
        label={t('key.label')}
        onChange={value => setValue('clientIdentity.key', value)}
      >
        <TextArea
          placeholder={t('key.placeholder')}
          id="key"
          {...register('clientIdentity.key')}
        />
      </UploadFile>
    </form>
  );
};

export default ClientIdentity;
