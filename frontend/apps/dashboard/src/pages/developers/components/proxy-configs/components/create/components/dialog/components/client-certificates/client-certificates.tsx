import { useTranslation } from '@onefootprint/hooks';
import { IcoFileText224, IcoKey24 } from '@onefootprint/icons';
import { Box, Divider, Typography } from '@onefootprint/ui';
import React from 'react';

import UploadFile from '../upload-file';

const ClientCertificates = () => {
  const { t } = useTranslation(
    'pages.proxy-configs.create.form.client-certificates',
  );

  return (
    <Box>
      <Typography variant="label-2" sx={{ marginBottom: 5 }}>
        {t('title')}
      </Typography>
      <UploadFile
        iconComponent={IcoFileText224}
        label={t('certificate.label')}
        cta={t('certificate.cta')}
        placeholder={t('certificate.placeholder')}
      />
      <Box sx={{ marginY: 7 }}>
        <Divider />
      </Box>
      <UploadFile
        iconComponent={IcoKey24}
        label={t('certificate.label')}
        cta={t('certificate.cta')}
        placeholder={t('certificate.placeholder')}
      />
    </Box>
  );
};

export default ClientCertificates;
