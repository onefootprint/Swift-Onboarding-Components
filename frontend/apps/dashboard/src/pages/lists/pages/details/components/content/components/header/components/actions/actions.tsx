import { deleteOrgListsByListIdMutation } from '@onefootprint/axios/dashboard';
import { useRequestErrorToast } from '@onefootprint/hooks';
import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import { Dropdown, IconButton, useConfirmationDialog } from '@onefootprint/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
type ActionsProps = {
  disabled?: boolean;
};

const Actions = ({ disabled }: ActionsProps) => {
  const { t } = useTranslation('lists', { keyPrefix: 'details.header.actions' });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const id = router.query.id as string;
  const confirmationDialog = useConfirmationDialog();
  const showErrorToast = useRequestErrorToast();
  const { invalidateQueries } = useQueryClient();
  const deleteListMutation = useMutation(deleteOrgListsByListIdMutation());

  const deleteList = () => {
    deleteListMutation.mutate(
      { path: { listId: id } },
      {
        onError: (error: Error) => {
          showErrorToast(error);
          confirmationDialog.hide();
        },
        onSuccess: () => {
          invalidateQueries();
          confirmationDialog.hide();
          router.push('/lists');
        },
      },
    );
  };

  const launchDeleteConfirmation = () => {
    setIsDropdownOpen(false);
    // Reset dialog state before opening
    confirmationDialog.open({
      description: t('delete-confirmation.description'),
      title: t('delete-confirmation.title'),
      secondaryButton: {
        label: t('delete-confirmation.cta.cancel'),
        onClick: () => confirmationDialog.hide(),
      },
      primaryButton: {
        label: t('delete-confirmation.cta.delete'),
        onClick: deleteList,
      },
    });
  };

  return (
    <Dropdown.Root onOpenChange={setIsDropdownOpen} open={isDropdownOpen}>
      <Dropdown.Trigger aria-label={t('delete')} disabled={disabled} asChild>
        <div>
          <IconButton aria-label={t('delete')} size="compact" variant="outline">
            <IcoDotsHorizontal24 />
          </IconButton>
        </div>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content align="end" sideOffset={8}>
          <Dropdown.Item onSelect={launchDeleteConfirmation}>{t('delete')}</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
};

export default Actions;
