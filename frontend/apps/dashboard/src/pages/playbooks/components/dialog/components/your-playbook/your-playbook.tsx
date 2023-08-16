import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';

const YourPlaybook = () => {
  const { t } = useTranslation('pages.playbooks.dialog.your-playbook');
  return (
    <Container>
      <Header>
        <Typography variant="label-1">{t('title')}</Typography>
        <Typography variant="body-2">{t('subtitle')}</Typography>
      </Header>
    </Container>
  );
};

export default YourPlaybook;

const Header = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
  `};
`;

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
    width: 520px;
    white-space: pre-wrap;
  `};
`;
