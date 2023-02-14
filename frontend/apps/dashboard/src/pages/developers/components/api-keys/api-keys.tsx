import { useToggle, useTranslation } from '@onefootprint/hooks';
import { Box, Button, Typography } from '@onefootprint/ui';
import React from 'react';
import PermissionGate, { Scope } from 'src/components/permission-gate';
import styled, { css } from 'styled-components';

import CreateDialog from './components/create-dialog';
import Table from './components/table';

const ApiKeys = () => {
  const { t } = useTranslation('pages.developers.api-keys');
  const [isCreateDialogOpen, openCreateDialog, closeCreateDialog] =
    useToggle(false);

  return (
    <section data-testid="api-keys-section">
      <Header>
        <Box>
          <Typography variant="label-1" as="h3" sx={{ marginBottom: 2 }}>
            {t('header.title')}
          </Typography>
          <Typography variant="body-3">{t('header.subtitle')}</Typography>
        </Box>
        <PermissionGate
          fallbackText={t('header.cta-not-allowed')}
          scope={Scope.apiKeys}
        >
          <Button onClick={openCreateDialog} size="small" variant="secondary">
            {t('header.cta')}
          </Button>
        </PermissionGate>
      </Header>
      <Box sx={{ marginY: 5 }} />
      <Table />
      <CreateDialog open={isCreateDialogOpen} onClose={closeCreateDialog} />
    </section>
  );
};

const Header = styled.header`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[2]};
    justify-content: space-between;
  `}
`;

export default ApiKeys;
