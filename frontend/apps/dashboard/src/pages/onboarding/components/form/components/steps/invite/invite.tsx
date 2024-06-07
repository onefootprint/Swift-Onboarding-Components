import { RoleKind } from '@onefootprint/types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useOrg from 'src/hooks/use-org';
import useRoles from 'src/hooks/use-roles';

import Header from '../header';
import Content from './components/content';
import ErrorComponent from './components/error';
import Loading from './components/loading';

export type InviteProps = {
  onBack: () => void;
  onComplete: () => void;
};

const Invite = ({ onBack, onComplete }: InviteProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.onboarding.invite',
  });
  const rolesQuery = useRoles(RoleKind.dashboardUser);
  const orgQuery = useOrg();

  return (
    <>
      <Header title={t('title')} subtitle={t('subtitle')} />
      {(rolesQuery.isLoading || orgQuery.isLoading) && <Loading />}
      {rolesQuery.data && orgQuery.data && (
        <Content
          defaultRole={rolesQuery.options[0]}
          onBack={onBack}
          onComplete={onComplete}
          org={orgQuery.data}
          roles={rolesQuery.options}
        />
      )}
      {(rolesQuery.error || orgQuery.error) && <ErrorComponent error={rolesQuery.error || orgQuery.error} />}
    </>
  );
};

export default Invite;
