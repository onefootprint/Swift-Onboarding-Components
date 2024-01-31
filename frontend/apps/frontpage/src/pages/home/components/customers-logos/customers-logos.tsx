import { IcoSparkles40 } from '@onefootprint/icons';
import { Container, Stack, Typography } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import SectionVerticalSpacer from 'src/components/section-vertical-spacer';

import Logos from './logos';

const CustomersLogos = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.customers-logos',
  });
  return (
    <Container>
      <SectionVerticalSpacer />
      <Stack direction="column" gap={9} align="center">
        <Stack
          direction="column"
          gap={6}
          align="center"
          maxWidth="540px"
          textAlign="center"
        >
          <IcoSparkles40 color="secondary" />
          <Typography variant="display-4">{t('title')}</Typography>
        </Stack>
        <Logos />
      </Stack>
    </Container>
  );
};

export default CustomersLogos;
