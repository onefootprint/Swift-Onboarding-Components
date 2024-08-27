import { useToggle } from '@onefootprint/hooks';
import { RoleKind, RoleScopeKind } from '@onefootprint/types';
import { Box, Button, Divider } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import PermissionGate from 'src/components/permission-gate';
import CreateDialog from 'src/components/roles/create-dialog';
import SectionHeader from 'src/components/section-header';

import Table from './components/table';

const Roles = () => {
  const { t } = useTranslation('api-keys', { keyPrefix: 'roles' });
  const [isCreateDialogOpen, openCreateDialog, closeCreateDialog] = useToggle(false);

  return (
    <>
      <SectionHeader title={t('header.title')} subtitle={t('header.subtitle')}>
        <PermissionGate fallbackText={t('header.cta-not-allowed')} scopeKind={RoleScopeKind.apiKeys}>
          <Button variant="secondary" onClick={openCreateDialog}>
            {t('header.cta')}
          </Button>
        </PermissionGate>
      </SectionHeader>
      <Box marginTop={5} marginBottom={5}>
        <Divider />
      </Box>
      <Table />
      <CreateDialog open={isCreateDialogOpen} handleClose={closeCreateDialog} kind={RoleKind.apiKey} />
    </>
  );
};

export default Roles;
