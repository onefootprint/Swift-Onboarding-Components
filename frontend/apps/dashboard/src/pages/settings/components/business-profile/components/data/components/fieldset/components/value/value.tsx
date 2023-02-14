import { useTranslation } from '@onefootprint/hooks';
import { RoleScope } from '@onefootprint/types';
import { LinkButton, Typography } from '@onefootprint/ui';
import React from 'react';
import PermissionGate from 'src/components/permission-gate';

export type ValueProps = {
  children?: string | null;
  cta: {
    label: string;
    onClick: () => void;
  };
};

const Value = ({ children, cta }: ValueProps) => {
  const { t } = useTranslation('pages.settings.business-profile');

  return children ? (
    <Typography variant="body-3">{children}</Typography>
  ) : (
    <PermissionGate
      scope={RoleScope.orgSettings}
      fallbackText={t('not-allowed')}
    >
      <LinkButton size="compact" onClick={cta.onClick}>
        {cta.label}
      </LinkButton>
    </PermissionGate>
  );
};

export default Value;
