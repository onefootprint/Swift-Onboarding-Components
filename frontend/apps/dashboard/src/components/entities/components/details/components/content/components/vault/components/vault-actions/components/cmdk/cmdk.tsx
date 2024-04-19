import { EntityKind, EntityStatus, ReviewStatus } from '@onefootprint/types';
import { createFontStyles, Overlay } from '@onefootprint/ui';
import { Command } from 'cmdk';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useCurrentEntity from 'src/components/entities/components/details/hooks/use-current-entity';
import styled, { css } from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

import { useEntityContext } from '@/entity/hooks/use-entity-context';

import useDecryptControls from '../../hooks/use-decrypt-controls';
import useEditControls from '../../hooks/use-edit-controls';
import type { VaultActionsControlsProps } from '../../vault-actions';
import RequestMoreInfoDialog from '../request-more-info-dialog';
import { ActionType } from './cmdk.types';
import ActionList from './components/main-dialog/action-list/action-list';
import Footer from './components/main-dialog/footer/footer';
import SearchInput from './components/main-dialog/search-input';
import ManualReviewDialog from './components/manual-review-dialog';

const Cmd = ({ entity }: VaultActionsControlsProps) => {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { data: entityData } = useCurrentEntity();
  const [dialogOpen, setDialogOpen] = useState(false);
  const decryptControls = useDecryptControls();
  const [retrigerDialogOpen, setRetrigerDialogOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus | undefined>();
  const editControls = useEditControls();
  const { kind } = useEntityContext();
  const canDecrypt = !!entity.decryptableAttributes.length;

  const shouldRenderManualReview =
    entityData && entityData.status !== EntityStatus.none;

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
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    }
  };

  useEffectOnce(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  const handleOpenDialog = (dialogStatus: ReviewStatus) => {
    setReviewStatus(dialogStatus);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setReviewStatus(undefined);
  };

  const handleRetrigerDialogClose = () => {
    setRetrigerDialogOpen(false);
  };

  const handleRetrigerDialogOpen = () => {
    setRetrigerDialogOpen(true);
  };

  const actions = [
    {
      title: t(
        `components.cmdk.review.${
          kind === EntityKind.business ? 'title-business' : 'title-user'
        }`,
      ),
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
          onSelect: () => handleOpenDialog(ReviewStatus.fail),
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
          onSelect: () => handleOpenDialog(ReviewStatus.pass),
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
          onSelect: handleRetrigerDialogOpen,
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
          onSelect: () =>
            decryptControls.submitAllFields(entity.decryptableAttributes),
          closeAfterSelect: true,
          disabled: !canDecrypt,
        },
      ],
    },
  ];

  return (
    <>
      <DialogContainer
        open={open}
        onOpenChange={setOpen}
        label={t('components.cmdk.decrypt.title')}
      >
        <SearchInput
          value={search}
          onValueChange={setSearch}
          onErase={resetSearch}
        />
        <ActionList
          actionsArray={actions}
          setOpen={setOpen}
          hasReview={shouldRenderManualReview}
        />
        <Footer />
      </DialogContainer>
      <RequestMoreInfoDialog
        open={retrigerDialogOpen}
        onClose={handleRetrigerDialogClose}
      />
      {dialogOpen && reviewStatus && (
        <ManualReviewDialog
          status={reviewStatus}
          open={dialogOpen}
          onClose={handleCloseDialog}
        />
      )}
      <Overlay isVisible={open} />
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
    box-shadow: ${theme.elevation[3]};
    border-radius: ${theme.borderRadius.default};
    width: 640px;
    overflow: hidden;
  `};
`;

export default Cmd;
