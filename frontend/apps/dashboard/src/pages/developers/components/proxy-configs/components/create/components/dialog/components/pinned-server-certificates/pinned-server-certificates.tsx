import { useTranslation } from '@onefootprint/hooks';
import { IcoFileText224, IcoPlusSmall16 } from '@onefootprint/icons';
import { Box, LinkButton, Typography } from '@onefootprint/ui';
import React from 'react';

import UploadFile from '../upload-file';

const PinnedServerCertificates = () => {
  const { t } = useTranslation(
    'pages.proxy-configs.create.form.pinned-server-certificates',
  );

  return (
    <Box>
      <Typography variant="label-2" sx={{ marginBottom: 5 }}>
        {t('title')}
      </Typography>
      <Box sx={{ marginBottom: 5 }}>
        <UploadFile
          iconComponent={IcoFileText224}
          label={t('certificate.label')}
          cta={t('certificate.cta')}
          placeholder={t('certificate.placeholder')}
        />
      </Box>
      <Box>
        <LinkButton
          iconComponent={IcoPlusSmall16}
          iconPosition="left"
          size="compact"
        >
          {t('add-more')}
        </LinkButton>
      </Box>
    </Box>
  );
};

export default PinnedServerCertificates;
