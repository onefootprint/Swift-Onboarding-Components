import type { L10n } from '@onefootprint/footprint-js';
import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { Grid, InlineAlert, Typography } from '@onefootprint/ui';
import React from 'react';

import Email from './components/email';
import Header from './components/header';
import Name from './components/name';
import OwnershipStake from './components/ownership-stake';
import Phone from './components/phone';

export type FieldsProps = {
  index: number;
  onRemove: (index: number) => void;
  config?: PublicOnboardingConfig;
  l10n?: L10n;
};

const Fields = ({ index, onRemove, config, l10n }: FieldsProps) => {
  const { t } = useTranslation('pages.beneficial-owners.form.fields');

  const handleRemove = () => {
    onRemove(index);
  };

  return (
    <Container
      rowGap={4}
      padding={5}
      borderWidth={1}
      borderColor="tertiary"
      borderRadius="default"
    >
      <Header shouldShowRemove={index > 0} onRemove={handleRemove} />
      {index === 0 && (
        <InlineAlert variant="info">
          <Typography variant="body-2" color="info">
            {t('primary-bo-name-hint')}
          </Typography>
        </InlineAlert>
      )}
      <Name index={index} />
      <Email index={index} />
      <Phone index={index} config={config} locale={l10n?.locale} />
      <OwnershipStake index={index} />
    </Container>
  );
};

const Container = styled(Grid.Container)`
  ${({ theme }) => css`
    box-shadow: ${theme.elevation[1]};
  `}
`;

export default Fields;
