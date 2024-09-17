import { EntityKind, EntityStatus, ReviewStatus } from '@onefootprint/types';
import { Overlay, createFontStyles } from '@onefootprint/ui';
import { Command } from 'cmdk';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useCurrentEntity from 'src/components/entities/components/details/hooks/use-current-entity';
import styled, { css } from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

import { useEntityContext } from '@/entity/hooks/use-entity-context';

import useDecryptControls from '../../hooks/use-decrypt-controls';
import useEditControls from '../../hooks/use-edit-controls';
import type { VaultActionsControlsProps } from '../../vault-actions';
import ManualReviewDialog from '../manual-review/components/manual-review-dialog';
import RequestMoreInfoDialog from '../request-more-info-dialog';
import { ActionType } from './cmdk.types';
import DiscoverFeatureChip from './components/discover-feature-chip';
import ActionList from './components/main-dialog/action-list/action-list';
import Footer from './components/main-dialog/footer/footer';
import SearchInput from './components/main-dialog/search-input';

enum CmdKDialog {
  reviewPass = 0,
  reviewFail = 1,
  editVault = 2,
  requestMoreInfo = 3,
  decrypt = 4,
  decryptAll = 5,
}

const SHOW_TIMES_LIMIT = 5;

const Cmd = ({ entity }: VaultActionsControlsProps) => {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState<CmdKDialog | null>(null);
  const { data: entityData } = useCurrentEntity();
  const decryptControls = useDecryptControls();
  const editControls = useEditControls();
  const { kind } = useEntityContext();
  const canDecrypt = !!entity.decryptableAttributes.length;

  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  const [timesOpened, setTimesOpened] = useState(Number.parseInt(localStorage.getItem('timesOpened') || '0', 10));

  const shouldRenderManualReview = entityData && entityData.status !== EntityStatus.none;

  const shouldShowDiscoverFeature =
    shouldRenderManualReview && (hasOpenedOnce ? false : timesOpened < SHOW_TIMES_LIMIT);

  const resetSearch = () => {
    setSearch('');
  };

  const handleKeyDown = (e: {
    key: string;
    metaKey: boolean;
    ctrlKey: boolean;
    preventDefault: () => void;
  }) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setOpen(currentOpen => !currentOpen);
      setHasOpenedOnce(true);
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open) {
      setTimesOpened(prev => {
        const newCount = prev + 1;
        localStorage.setItem('timesOpened', newCount.toString());
        return newCount;
      });
    }
  }, [open]);

  useEffectOnce(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  const handleCloseDialog = () => {
    setOpenDialog(null);
  };

  const handleOpenPassDialog = () => {
    setOpenDialog(CmdKDialog.reviewPass);
  };

  const handleOpenFailDialog = () => {
    setOpenDialog(CmdKDialog.reviewFail);
  };

  const handleOpenRequestMoreInfoDialog = () => {
    setOpenDialog(CmdKDialog.requestMoreInfo);
  };

  const actions = [
    {
      title: t(`components.cmdk.review.${kind === EntityKind.business ? 'title-business' : 'title-user'}`),
      type: ActionType.REVIEW,
      actions: [
        {
          label:
            entityData && entityData.status === EntityStatus.failed
              ? t('components.cmdk.review.keep-as', {
                  status: t(`entity-statuses.${ReviewStatus.fail}`),
                })
              : t('components.cmdk.review.mark-as', {
                  status: t(`entity-statuses.${ReviewStatus.fail}`),
                }),
          value: 'failed',
          onSelect: handleOpenFailDialog,
          closeAfterSelect: true,
        },
        {
          label:
            entityData && entityData.status === EntityStatus.pass
              ? t('components.cmdk.review.keep-as', {
                  status: t(`entity-statuses.${ReviewStatus.pass}`),
                })
              : t('components.cmdk.review.mark-as', {
                  status: t(`entity-statuses.${ReviewStatus.pass}`),
                }),
          value: 'verified',
          onSelect: handleOpenPassDialog,
          closeAfterSelect: true,
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
          onSelect: editControls.start,
          closeAfterSelect: true,
        },
        {
          label: t('components.cmdk.actions.request'),
          value: 'request',
          onSelect: handleOpenRequestMoreInfoDialog,
          closeAfterSelect: true,
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

  return (
    <>
      <DialogContainer open={open} onOpenChange={setOpen} label={t('components.cmdk.decrypt.title')}>
        <SearchInput value={search} onValueChange={setSearch} onErase={resetSearch} />
        <ActionList actionsArray={actions} setOpen={setOpen} hasReview={shouldRenderManualReview} />
        <Footer />
      </DialogContainer>
      {openDialog === CmdKDialog.requestMoreInfo && <RequestMoreInfoDialog open onClose={handleCloseDialog} />}
      {(openDialog === CmdKDialog.reviewPass || openDialog === CmdKDialog.reviewFail) && (
        <ManualReviewDialog
          status={openDialog === CmdKDialog.reviewPass ? ReviewStatus.pass : ReviewStatus.fail}
          open
          onClose={handleCloseDialog}
        />
      )}
      <Overlay isVisible={open} />
      <DiscoverFeatureChip isVisible={shouldShowDiscoverFeature} text={t('components.cmdk.discover')} />
    </>
  );
};

const DialogContainer = styled(Command.Dialog)`
  ${({ theme }) => css`
    ${createFontStyles('body-3')}
    z-index: ${theme.zIndex.dialog};
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    background-color: ${theme.backgroundColor.primary};
    box-shadow: ${theme.elevation[2]};
    border-radius: ${theme.borderRadius.default};
    width: 640px;
    overflow: hidden;
  `};
`;

export default Cmd;
