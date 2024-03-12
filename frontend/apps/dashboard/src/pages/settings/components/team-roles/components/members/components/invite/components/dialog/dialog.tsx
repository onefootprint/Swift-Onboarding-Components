import { RoleKind } from '@onefootprint/types';
import { Dialog as FPDialog } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useRoles from 'src/hooks/use-roles';

import Data from './components/data';
import Error from './components/error';
import Loading from './components/loading';
import type { Invitation } from './dialog.types';
import useInviteMembers from './hooks/use-invite-members';

type DialogProps = {
  onClose: () => void;
  open: boolean;
};

const Dialog = ({ onClose, open }: DialogProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.settings.members.invite',
  });
  const rolesQuery = useRoles(RoleKind.dashboardUser);
  const inviteMembersMutation = useInviteMembers();

  const handleSubmit = (invitations: Invitation[]) => {
    inviteMembersMutation.mutate(invitations, {
      onSuccess: onClose,
    });
  };

  return (
    <FPDialog
      title={t('title')}
      onClose={onClose}
      open={open}
      primaryButton={{
        form: 'members-invite-form',
        label: 'Invite',
        loading: inviteMembersMutation.isLoading,
        disabled: rolesQuery.isLoading,
        type: 'submit',
      }}
      secondaryButton={{
        label: 'Cancel',
        disabled: inviteMembersMutation.isLoading,
        onClick: onClose,
      }}
    >
      <>
        {rolesQuery.isLoading && <Loading />}
        {rolesQuery.data && (
          <Data
            roles={rolesQuery.options}
            defaultRole={rolesQuery.options[0]}
            onSubmit={handleSubmit}
          />
        )}
        {rolesQuery.errorMessage && <Error message={rolesQuery.errorMessage} />}
      </>
    </FPDialog>
  );
};

export default Dialog;
