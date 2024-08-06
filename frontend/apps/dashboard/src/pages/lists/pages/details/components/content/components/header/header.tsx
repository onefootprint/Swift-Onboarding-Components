import { RoleScopeKind } from '@onefootprint/types';
import { Button, Shimmer, Stack, Text } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PermissionGate from 'src/components/permission-gate';
import useListDetails from 'src/pages/lists/pages/details/hooks/use-list-details';

import Actions from './components/actions';
import EditDialog from './components/edit-dialog';

const Header = () => {
  const router = useRouter();
  const id = router.query.id as string;
  const { isLoading, error, data } = useListDetails(id);
  const { t } = useTranslation('lists', {
    keyPrefix: 'details.header',
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  if (isLoading || error || !data) {
    return null;
  }

  const launchEditDialog = () => {
    setIsEditDialogOpen(true);
  };

  const closeDialog = () => {
    setIsEditDialogOpen(false);
  };

  return (
    <Stack aria-label={data.name} direction="row" justifyContent="space-between">
      <Stack display="flex" direction="column">
        <Stack gap={3}>
          {data.name ? <Text variant="label-1">{data.name}</Text> : <Shimmer height="27px" width="75px" />}
          <Text tag="span" variant="label-1">
            •
          </Text>
          {data.alias ? (
            <Text variant="label-1" color="tertiary">
              {data.alias}
            </Text>
          ) : (
            <Shimmer height="27px" width="75px" />
          )}
        </Stack>
        <Stack align="center" gap={2}>
          <Text variant="body-4" color="secondary">
            {t('kind')}
          </Text>
          <Text variant="label-4" color="secondary">
            {data.kind}
          </Text>
        </Stack>
      </Stack>
      <Stack align="center" gap={3}>
        <PermissionGate fallbackText={t('cta-edit-not-allowed')} scopeKind={RoleScopeKind.writeLists}>
          <Button variant="secondary" onClick={launchEditDialog}>
            {t('edit')}
          </Button>
        </PermissionGate>
        <PermissionGate fallbackText={t('cta-delete-not-allowed')} scopeKind={RoleScopeKind.writeLists}>
          <Actions />
        </PermissionGate>
      </Stack>
      <EditDialog open={isEditDialogOpen} onClose={closeDialog} onEdit={closeDialog} />
    </Stack>
  );
};

export default Header;
