import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { InlineAlert, Typography } from '@onefootprint/ui';
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
};

const Fields = ({ index, onRemove, config }: FieldsProps) => {
  const { t } = useTranslation('pages.beneficial-owners.form.fields');

  const handleRemove = () => {
    onRemove(index);
  };

  return (
    <Container>
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
      <Phone index={index} config={config} />
      <OwnershipStake index={index} />
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    box-shadow: ${theme.elevation[1]};
    padding: ${theme.spacing[5]};
    display: grid;
    row-gap: ${theme.spacing[4]};
  `}
`;

export default Fields;
