import { useTranslation } from '@onefootprint/hooks';
import styled from '@onefootprint/styled';
import { Button, Typography } from '@onefootprint/ui';
import Head from 'next/head';
import React, { useState } from 'react';

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
        <Button size="small" onClick={onCreatePlaybook}>
          {t('create-button')}
        </Button>
      </HeaderContainer>
      <Typography variant="body-2">{t('header.subtitle')}</Typography>
      <br />
      <Typography variant="body-2">{t('empty-description')}</Typography>
      {dialogOpen && <div>DIALOG PLACEHOLDER</div>}
    </>
  );
};

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export default Playbooks;
