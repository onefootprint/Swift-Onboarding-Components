import { useTranslation } from '@onefootprint/hooks';
import { Dialog as FPDialog } from '@onefootprint/ui';
import React from 'react';

import useRolesOptions from '../../../../hooks/use-roles-options';
import Data from './components/data';
import Error from './components/error';
import Loading from './components/loading';
import type { Invitation } from './dialog.types';
import useInviteMembers from './hooks/use-invite-members';

type DialogProps = {
  onClose: () => void;
  open: boolean;
};

const Content = ({ onClose, open }: DialogProps) => {
  const { t } = useTranslation('pages.settings.members.invite');
  const rolesQuery = useRolesOptions();
  const inviteMembersMutations = useInviteMembers();

  const handleSubmit = (invitations: Invitation[]) => {
    inviteMembersMutations.mutate(invitations, { onSuccess: onClose });
  };

  return (
    <FPDialog
      title={t('title')}
      onClose={onClose}
      open={open}
      primaryButton={{
        form: 'members-invite-form',
        label: 'Invite',
        loading: inviteMembersMutations.isLoading,
        disabled: rolesQuery.isLoading,
        type: 'submit',
      }}
      secondaryButton={{
        label: 'Cancel',
        disabled: inviteMembersMutations.isLoading,
        onClick: onClose,
      }}
    >
      <>
        {rolesQuery.isLoading && <Loading />}
        {rolesQuery.data && (
          <Data
            roles={rolesQuery.data}
            defaultRole={rolesQuery.data[0]}
            onSubmit={handleSubmit}
          />
        )}
        {rolesQuery.errorMessage && <Error message={rolesQuery.errorMessage} />}
      </>
    </FPDialog>
  );
};

export default Content;
