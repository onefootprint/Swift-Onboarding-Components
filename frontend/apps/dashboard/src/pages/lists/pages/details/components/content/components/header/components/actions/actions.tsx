import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import { Dropdown, useConfirmationDialog } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

import useDeleteList from './hooks/use-delete-list';

type ActionsProps = {
  disabled?: boolean; // injected by the PermissionsGate
};

const Actions = ({ disabled }: ActionsProps) => {
  const router = useRouter();
  const id = router.query.id as string;
  const { t } = useTranslation('lists', {
    keyPrefix: 'details.header.actions',
  });
  const confirmationDialog = useConfirmationDialog();
  const deleteListMutation = useDeleteList(id);

  const deleteList = () => {
    deleteListMutation.mutate(undefined, {
      onSuccess: () => {
        confirmationDialog.hide();
        router.push('/lists');
      },
      onError: () => {
        confirmationDialog.hide();
      },
    });
  };

  const launchDeleteConfirmation = () => {
    confirmationDialog.open({
      description: t('delete-confirmation.description'),
      title: t('delete-confirmation.title'),
      secondaryButton: { label: t('delete-confirmation.cta.cancel') },
      primaryButton: {
        label: t('delete-confirmation.cta.delete'),
        onClick: deleteList,
      },
    });
  };

  return (
    <Dropdown.Root>
      <Dropdown.Trigger variant="button" aria-label={t('delete')} disabled={disabled}>
        <IcoDotsHorizontal24 />
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
