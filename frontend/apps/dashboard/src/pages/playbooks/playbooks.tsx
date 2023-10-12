import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { RoleScopeKind } from '@onefootprint/types';
import { Button, Pagination, Stack, Typography } from '@onefootprint/ui';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import PermissionGate from 'src/components/permission-gate';
import WaveAnimation from 'src/components/wave-animation';

import Details from './components/details';
import Dialog from './components/dialog';
import Table from './components/table';
import usePlaybooks from './hooks/use-playbooks';

const Playbooks = () => {
  const { t } = useTranslation('pages.playbooks');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hasHadPlaybook, setHasHadPlaybook] = useState(false);
  const {
    data: response,
    errorMessage,
    isLoading,
    pagination,
  } = usePlaybooks();

  const onCreatePlaybook = () => {
    setDialogOpen(true);
  };

  useEffect(() => {
    if (response && response?.data?.length > 0) {
      setHasHadPlaybook(true);
    }
  }, [response]);

  return (
    <Container>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <HeaderContainer>
        <Title>
          <Typography variant="heading-2">{t('header.title')}</Typography>
          <Typography variant="body-2" color="secondary">
            {t('header.subtitle')}
          </Typography>
        </Title>
        <Wrapper>
          <PermissionGate
            fallbackText={t('cta-not-allowed')}
            scopeKind={RoleScopeKind.onboardingConfiguration}
          >
            <Button
              size="small"
              sx={{ whiteSpace: 'nowrap' }}
              onClick={onCreatePlaybook}
            >
              {t('create-button')}
            </Button>
          </PermissionGate>
          {!hasHadPlaybook && <WaveAnimation width={140} />}
        </Wrapper>
      </HeaderContainer>
      <Stack direction="column">
        <Table
          data={response?.data}
          errorMessage={errorMessage}
          isLoading={isLoading}
        />
        {response && response.meta.count > 0 && (
          <Pagination
            hasNextPage={pagination.hasNextPage}
            hasPrevPage={pagination.hasPrevPage}
            onNextPage={pagination.loadNextPage}
            onPrevPage={pagination.loadPrevPage}
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            totalNumResults={response.meta.count}
          />
        )}
      </Stack>
      <Details />
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Container>
  );
};

const Title = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
    max-width: 650px;
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

const Wrapper = styled.div`
  position: relative;
`;

export default Playbooks;
