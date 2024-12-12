import { useEntityContext } from '@/entity/hooks/use-entity-context';
import { type DataIdentifier, EntityKind, EntityStatus, IdDI, ReviewStatus, RoleScopeKind } from '@onefootprint/types';
import { Command } from '@onefootprint/ui';
import { parseInt as lodashParseInt } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useCurrentEntity from 'src/components/entities/components/details/hooks/use-current-entity';

import usePermissions from 'src/hooks/use-permissions';
import hasSomeDiDecryptable from 'src/utils/has-some-di-decryptable';
import useDecryptControls from '../../hooks/use-decrypt-controls';
import type { VaultActionsControlsProps } from '../../vault-actions';
import EditVaultDrawer from '../edit-vault-drawer';
import ManualReviewDialog from '../manual-review/components/manual-review-dialog';
import RequestMoreInfoDialog from '../user-actions/components/request-more-info-dialog';
import Footer from './components/footer/footer';
import { ActionType } from './shortcuts.types';

const MAX_DISCOVER_COUNT = 3;

enum CmdKDialog {
  reviewPass = 0,
  reviewFail = 1,
  editVault = 2,
  requestMoreInfo = 3,
  decrypt = 4,
  decryptAll = 5,
}

type Action = {
  label: string;
  value: string;
  onSelect: () => void;
  closeAfterSelect: boolean;
  disabled: boolean;
};

type ActionGroup = {
  title: string;
  type: ActionType;
  actions: Action[];
};

const Cmd = ({ entity }: VaultActionsControlsProps) => {
  const { t } = useTranslation('common');
  const { data: entityData } = useCurrentEntity();
  const decryptControls = useDecryptControls();
  const { kind } = useEntityContext();
  const kindText =
    kind === EntityKind.person ? t('components.cmdk.review.kind.user') : t('components.cmdk.review.kind.business');
  const { hasPermission } = usePermissions();
  const canDecrypt = hasSomeDiDecryptable(entity);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState<CmdKDialog | null>(null);
  const [discoverOpen, setDiscoverOpen] = useState(false);

  const hasContactInfo = entity.data.some(d => [IdDI.phoneNumber as DataIdentifier, IdDI.email].includes(d.identifier));

  const resetSearch = () => {
    setSearch('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(null);
  };

  const handleOpenPassDialog = () => {
    setOpenDialog(CmdKDialog.reviewPass);
  };

  const handleOpenFailDialog = () => {
    setOpenDialog(CmdKDialog.reviewFail);
  };

  const handleOpenEditVaultDrawer = () => {
    setOpenDialog(CmdKDialog.editVault);
  };

  const handleOpenRequestMoreInfoDialog = () => {
    setOpenDialog(CmdKDialog.requestMoreInfo);
  };

  const handleOnSelect = (onSelect: () => void, closeAfterSelect: boolean) => () => {
    if (onSelect) {
      onSelect();
    }
    if (closeAfterSelect) {
      setOpen(false);
    }
  };

  const getDiscoverCount = () => {
    return lodashParseInt(localStorage.getItem('discoverCount') || '0', 10);
  };

  const setDiscoverCount = (count: number) => {
    localStorage.setItem('discoverCount', count.toString());
  };

  useEffect(() => {
    const discoverCount = getDiscoverCount();
    if (discoverCount < MAX_DISCOVER_COUNT) {
      setDiscoverCount(discoverCount);
      setDiscoverOpen(true);
    }
  }, []);

  const handleDiscoverClose = () => {
    const discoverCount = getDiscoverCount();
    if (discoverCount < MAX_DISCOVER_COUNT) {
      setDiscoverCount(discoverCount + 1);
    }
    setDiscoverOpen(false);
  };

  const handleShortcutOpen = () => {
    setDiscoverOpen(false);
    setDiscoverCount(MAX_DISCOVER_COUNT);
    setOpen(true);
  };

  const handleShortcutClose = () => {
    setOpen(false);
  };

  const actions: ActionGroup[] = [
    {
      title: t('components.cmdk.review.title', { kindText }),
      type: ActionType.REVIEW,
      actions: [
        {
          label:
            entityData && entityData.status === EntityStatus.failed
              ? t('components.cmdk.review.keep-as', {
                  kindText,
                  status: t(`entity-statuses.${ReviewStatus.fail}`),
                })
              : t('components.cmdk.review.mark-as', {
                  kindText,
                  status: t(`entity-statuses.${ReviewStatus.fail}`),
                }),
          value: 'failed',
          onSelect: handleOpenFailDialog,
          closeAfterSelect: true,
          disabled: !hasPermission(RoleScopeKind.manualReview),
        },
        {
          label:
            entityData && entityData.status === EntityStatus.pass
              ? t('components.cmdk.review.keep-as', {
                  kindText,
                  status: t(`entity-statuses.${ReviewStatus.pass}`),
                })
              : t('components.cmdk.review.mark-as', {
                  kindText,
                  status: t(`entity-statuses.${ReviewStatus.pass}`),
                }),
          value: 'verified',
          onSelect: handleOpenPassDialog,
          closeAfterSelect: true,
          disabled: !hasPermission(RoleScopeKind.manualReview),
        },
      ],
    },
    {
      title: t('components.cmdk.actions.title'),
      type: ActionType.USER_ACTIONS,
      actions: [
        {
          label: t('components.cmdk.actions.edit'),
          value: 'edit',
          onSelect: handleOpenEditVaultDrawer,
          closeAfterSelect: true,
          disabled: !hasPermission(RoleScopeKind.writeEntities),
        },
        {
          label: t('components.cmdk.actions.request'),
          value: 'request',
          onSelect: handleOpenRequestMoreInfoDialog,
          closeAfterSelect: true,
          disabled: !hasPermission(RoleScopeKind.manualReview) || !hasContactInfo,
        },
      ],
    },
    {
      title: t('components.cmdk.decrypt.title'),
      type: ActionType.DECRYPT,
      actions: [
        {
          label: t('components.cmdk.decrypt.decrypt-some'),
          value: 'decrypt',
          onSelect: decryptControls.start,
          closeAfterSelect: true,
          disabled: !canDecrypt,
        },
        {
          label: t('components.cmdk.decrypt.decrypt-all'),
          value: 'decrypt-all',
          onSelect: () => decryptControls.submitAllFields(),
          closeAfterSelect: true,
          disabled: !canDecrypt,
        },
      ],
    },
  ];

  const visibleActions = actions.filter(group => group.actions.some(action => !action.disabled));

  return (
    <>
      <Command.Discover open={discoverOpen} onClose={handleDiscoverClose}>
        {t('components.cmdk.discover')}
      </Command.Discover>
      <Command.Shortcut ctrlKey="k" onShortcut={handleShortcutOpen} onClose={handleShortcutClose} />
      <Command.Container open={open} onOpenChange={setOpen}>
        <Command.Input value={search} onValueChange={setSearch} onErase={resetSearch} />
        <Command.List>
          <Command.Empty>
            {visibleActions.length > 0 ? t('components.cmdk.no-results') : t('components.cmdk.no-permissions')}
          </Command.Empty>
          {visibleActions.map(({ title, actions }) => (
            <Command.Group key={title} heading={title}>
              {actions
                .filter(action => !action.disabled)
                .map(({ label, value, onSelect, closeAfterSelect }) => (
                  <Command.Item key={value} value={value} onSelect={handleOnSelect(onSelect, closeAfterSelect)}>
                    {label}
                  </Command.Item>
                ))}
            </Command.Group>
          ))}
        </Command.List>
        <Footer />
      </Command.Container>
      {openDialog === CmdKDialog.editVault && <EditVaultDrawer open onClose={handleCloseDialog} />}
      {openDialog === CmdKDialog.requestMoreInfo && <RequestMoreInfoDialog open onClose={handleCloseDialog} />}
      {(openDialog === CmdKDialog.reviewPass || openDialog === CmdKDialog.reviewFail) && (
        <ManualReviewDialog
          kind={kind}
          status={openDialog === CmdKDialog.reviewPass ? ReviewStatus.pass : ReviewStatus.fail}
          open
          onClose={handleCloseDialog}
        />
      )}
    </>
  );
};

export default Cmd;
