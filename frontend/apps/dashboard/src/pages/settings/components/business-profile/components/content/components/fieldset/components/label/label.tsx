import { useTranslation } from '@onefootprint/hooks';
import { IcoPencil16 } from '@onefootprint/icons';
import { RoleScopeKind } from '@onefootprint/types';
import { IconButton, Stack, Typography } from '@onefootprint/ui';
import React from 'react';
import PermissionGate from 'src/components/permission-gate';

export type LabelProps = {
  children: string;
  cta?: {
    label: string;
    onClick: () => void;
  };
};

const Label = ({ children, cta }: LabelProps) => {
  const { t } = useTranslation('pages.settings.business-profile');

  return (
    <Stack align="center" gap={3} height="32px">
      <Typography variant="label-3" color="tertiary">
        {children}
      </Typography>
      {cta && (
        <PermissionGate
          scopeKind={RoleScopeKind.orgSettings}
          fallbackText={t('not-allowed')}
        >
          <IconButton aria-label={cta.label} onClick={cta.onClick}>
            <IcoPencil16 />
          </IconButton>
        </PermissionGate>
      )}
    </Stack>
  );
};

export default Label;
