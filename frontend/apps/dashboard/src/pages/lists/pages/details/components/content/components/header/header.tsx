import { getOrgListsByListIdOptions } from '@onefootprint/axios/dashboard';
import { RoleScopeKind } from '@onefootprint/types';
import { Button, Shimmer } from '@onefootprint/ui';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PermissionGate from 'src/components/permission-gate';
import Actions from './components/actions';
import EditDialog from './components/edit-dialog';

const Header = () => {
  const router = useRouter();
  const id = router.query.id as string;
  const { isPending, error, data } = useQuery(getOrgListsByListIdOptions({ path: { listId: id } }));
  const { t } = useTranslation('lists', { keyPrefix: 'details.header' });

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  if (isPending || error || !data) {
    return null;
  }

  const launchEditDialog = () => {
    setIsEditDialogOpen(true);
  };

  const closeDialog = () => {
    setIsEditDialogOpen(false);
  };

  return (
    <div aria-label={data.name} className="flex flex-row justify-between">
      <div className="flex flex-col">
        <div className="flex gap-2">
          {data.name ? (
            <span className="text-primary text-label-1">{data.name}</span>
          ) : (
            <Shimmer height="27px" width="75px" />
          )}
          <span className="text-primary text-label-1">•</span>
          {data.alias ? (
            <span className="text-tertiary text-label-1">{data.alias}</span>
          ) : (
            <Shimmer height="27px" width="75px" />
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-secondary text-body-3">{t('kind')}</span>
          <span className="text-secondary text-label-3">{data.kind}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <PermissionGate fallbackText={t('cta-edit-not-allowed')} scopeKind={RoleScopeKind.writeLists}>
          <Button onClick={launchEditDialog} variant="secondary" size="compact">
            {t('edit')}
          </Button>
        </PermissionGate>
        <PermissionGate fallbackText={t('cta-delete-not-allowed')} scopeKind={RoleScopeKind.writeLists}>
          <Actions />
        </PermissionGate>
      </div>
      <EditDialog open={isEditDialogOpen} onClose={closeDialog} onEdit={closeDialog} />
    </div>
  );
};

export default Header;
