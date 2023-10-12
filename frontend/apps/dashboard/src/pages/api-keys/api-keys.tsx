import { useToggle, useTranslation } from '@onefootprint/hooks';
import { RoleScopeKind } from '@onefootprint/types';
import { Box, Button, Stack, Typography } from '@onefootprint/ui';
import Head from 'next/head';
import React from 'react';
import PermissionGate from 'src/components/permission-gate';

import CreateDialog from './components/create-dialog';
import Roles from './components/roles';
import Table from './components/table';

const ApiKeys = () => {
  const { t } = useTranslation('pages.api-keys');
  const [isCreateDialogOpen, openCreateDialog, closeCreateDialog] =
    useToggle(false);

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Box>
        <Stack align="center" justify="space-between" marginBottom={7}>
          <Stack direction="column" gap={2}>
            <Typography variant="heading-2">{t('header.title')}</Typography>
            <Typography variant="body-2" color="secondary">
              {t('header.subtitle')}
            </Typography>
          </Stack>
          <PermissionGate
            fallbackText={t('header.cta-not-allowed')}
            scopeKind={RoleScopeKind.apiKeys}
          >
            <Button onClick={openCreateDialog} size="small" variant="primary">
              {t('header.cta')}
            </Button>
          </PermissionGate>
        </Stack>
        <Table />
        <CreateDialog open={isCreateDialogOpen} onClose={closeCreateDialog} />
        <Box marginTop={9} />
        <Roles />
      </Box>
    </>
  );
};

export default ApiKeys;
