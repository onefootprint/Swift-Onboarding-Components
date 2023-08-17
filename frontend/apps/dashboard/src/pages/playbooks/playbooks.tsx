import { useTranslation } from '@onefootprint/hooks';
import styled from '@onefootprint/styled';
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
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <HeaderContainer>
        <Typography variant="heading-3" sx={{ marginBottom: 5 }}>
          {t('header.title')}
        </Typography>
        <PermissionGate
          fallbackText={t('cta-not-allowed')}
          scopeKind={RoleScopeKind.onboardingConfiguration}
        >
          <Button size="small" onClick={onCreatePlaybook}>
            {t('create-button')}
          </Button>
        </PermissionGate>
      </HeaderContainer>
      <Typography variant="body-2">{t('header.subtitle')}</Typography>
      <br />
      <Typography variant="body-2">{t('empty-description')}</Typography>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
};

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export default Playbooks;
