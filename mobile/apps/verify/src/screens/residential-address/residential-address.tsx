import styled, { css } from '@onefootprint/styled';
import {
  Box,
  Button,
  Container,
  CountrySelect,
  Select,
  TextInput,
} from '@onefootprint/ui';
import React from 'react';

import Header from '@/components/header';
import states from '@/constants/states';
import useTranslation from '@/hooks/use-translation';

const ResidentialAddress = () => {
  const { t } = useTranslation('pages.residential-address');

  // TODO: we don't always show country of birth, so we should make this dynamic
  return (
    <Container scroll>
      <Header title={t('title')} subtitle={t('subtitle')} />
      <Box gap={7}>
        <CountrySelect />
        <TextInput
          label={t('address-input-1.label')}
          placeholder={t('address-input-1.placeholder')}
        />
        <TextInput
          label={t('address-input-2.label')}
          placeholder={t('address-input-2.placeholder')}
        />
        <Row>
          <Box flex={1}>
            <TextInput
              label={t('city-input.label')}
              placeholder={t('city-input.placeholder')}
              autoFocus
            />
          </Box>
          <Box flex={1}>
            <TextInput
              label={t('zip-input.label')}
              placeholder={t('zip-input.placeholder')}
            />
          </Box>
        </Row>
        <Select label={t('state-input.label')} options={states} />
        <Button variant="primary">{t('cta')}</Button>
      </Box>
    </Container>
  );
};

const Row = styled.View`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[4]};
    flex-direction: row;
  `}
`;

export default ResidentialAddress;
