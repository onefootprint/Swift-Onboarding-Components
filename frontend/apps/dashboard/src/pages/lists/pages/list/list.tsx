import { RoleScopeKind } from '@onefootprint/types';
import { Button, Stack, Text } from '@onefootprint/ui';
import Head from 'next/head';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PermissionGate from 'src/components/permission-gate';
import styled, { css } from 'styled-components';

import useLists from 'src/hooks/use-lists';
import CreateDialog from './components/create-dialog';
import Table from './components/table';

const List = () => {
  const { t } = useTranslation('lists', { keyPrefix: 'list' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: response, errorMessage, isLoading } = useLists();

  const handleOpen = () => {
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  return (
    <Container>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <HeaderContainer>
        <Title>
          <Text variant="heading-2">{t('header.title')}</Text>
          <Text variant="body-2" color="secondary">
            {t('header.subtitle')}
          </Text>
        </Title>
        <Wrapper>
          <PermissionGate
            fallbackText={t('cta-not-allowed')}
            scopeKind={RoleScopeKind.writeLists}
            tooltipPosition="left"
          >
            <Button onClick={handleOpen}>{t('create-button')}</Button>
          </PermissionGate>
        </Wrapper>
      </HeaderContainer>
      <Stack direction="column">
        <Table data={response?.data} errorMessage={errorMessage} isLoading={isLoading} />
      </Stack>
      <CreateDialog open={dialogOpen} onClose={handleClose} />
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

export default List;
