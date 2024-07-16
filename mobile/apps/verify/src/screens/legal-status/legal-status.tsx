import { VisaKind } from '@onefootprint/types';
import { Box, Button, Container, CountrySelect, LinkButton, Select, TextInput } from '@onefootprint/ui';
import React from 'react';

import Header from '@/components/header';
import useTranslation from '@/hooks/use-translation';

const LegalStatus = () => {
  const { t } = useTranslation('pages.legal-status');

  const options = Object.values(VisaKind).map(value => ({
    label: t(`visa-input.visa-kinds.${value}`),
    value,
  }));

  return (
    <Container scroll>
      <Header title={t('title')} subtitle={t('subtitle')} />
      <Box gap={7}>
        <CountrySelect />
        <CountrySelect />
        <Box alignItems="flex-start">
          <LinkButton>{t('add-citizenship')}</LinkButton>
        </Box>
        <Select label={t('visa-input.type')} options={options} />
        <TextInput
          label={t('visa-input.visa-expiration.label')}
          placeholder={t('visa-input.visa-expiration.placeholder')}
        />
        <Button variant="primary">{t('cta')}</Button>
      </Box>
    </Container>
  );
};

export default LegalStatus;
