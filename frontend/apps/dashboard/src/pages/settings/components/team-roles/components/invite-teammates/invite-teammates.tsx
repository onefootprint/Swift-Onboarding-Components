import { useTranslation } from '@onefootprint/hooks';
import { Typography } from '@onefootprint/ui';
import React from 'react';

// TODO: https://linear.app/footprint/issue/FP-1714/implement-invite-teammates-flow

type InviteTeammatesProps = {
  open: boolean;
  // onClose: () => void;
};

const InviteTeammates = ({ open }: InviteTeammatesProps) => {
  const { t } = useTranslation('pages.settings.team-roles.invite-teammates');
  return open ? <Typography variant="label-2">{t('title')}</Typography> : null;
};

export default InviteTeammates;
