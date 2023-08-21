import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { RoleScopeKind } from '@onefootprint/types';
import { Button, Typography } from '@onefootprint/ui';
import Head from 'next/head';
import React, { useState } from 'react';
import PermissionGate from 'src/components/permission-gate';

import Dialog from './components/dialog';

const Playbooks = () => {
  const { t } = useTranslation('pages.playbooks');
  const [dialogOpen, setDialogOpen] = useState(false);

  const onCreatePlaybook = () => {
    setDialogOpen(true);
  };

  return (
    <Container>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <HeaderContainer>
        <Title>
          <Typography variant="heading-3">{t('header.title')}</Typography>
          <Typography variant="body-2">{t('header.subtitle')}</Typography>
        </Title>
        <PermissionGate
          fallbackText={t('cta-not-allowed')}
          scopeKind={RoleScopeKind.onboardingConfiguration}
        >
          <Button size="small" onClick={onCreatePlaybook}>
            {t('create-button')}
          </Button>
        </PermissionGate>
      </HeaderContainer>
      <Typography variant="body-2">{t('empty-description')}</Typography>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Container>
  );
};

const Title = styled.div`
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
    gap: ${theme.spacing[8]};
  `};
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export default Playbooks;
