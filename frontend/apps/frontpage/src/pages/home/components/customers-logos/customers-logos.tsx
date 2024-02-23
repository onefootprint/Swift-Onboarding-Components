import { IcoSparkles40 } from '@onefootprint/icons';
import { Container, Stack, Text } from '@onefootprint/ui';
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
          <Text variant="display-4">{t('title')}</Text>
        </Stack>
        <Logos />
      </Stack>
    </Container>
  );
};

export default CustomersLogos;
