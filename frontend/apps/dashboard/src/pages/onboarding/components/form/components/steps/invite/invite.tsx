import { getOrgOptions } from '@onefootprint/axios/dashboard';
import { RoleKind } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('onboarding', {
    keyPrefix: 'invite',
  });
  const rolesQuery = useRoles(RoleKind.dashboardUser);
  const orgQuery = useQuery(getOrgOptions());

  return (
    <>
      <Header title={t('title')} subtitle={t('subtitle')} />
      {(rolesQuery.isPending || orgQuery.isPending) && <Loading />}
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
