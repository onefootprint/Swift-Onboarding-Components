import { useToggle, useTranslation } from '@onefootprint/hooks';
import { Box, Button, Divider, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import CreateDialog from './components/create-dialog';
import Table from './components/table';

const ApiKeys = () => {
  const [isCreateDialogOpen, openCreateDialog, closeCreateDialog] =
    useToggle(false);
  const { t } = useTranslation('pages.developers.api-keys');

  return (
    <section data-testid="api-keys-section">
      <Header>
        <Box>
          <Typography variant="label-1" as="h3" sx={{ marginBottom: 2 }}>
            {t('header.title')}
          </Typography>
          <Typography variant="body-3">{t('header.subtitle')}</Typography>
        </Box>
        <Button onClick={openCreateDialog} variant="secondary" size="small">
          {t('header.cta')}
        </Button>
      </Header>
      <Box sx={{ marginY: 5 }}>
        <Divider />
      </Box>
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
