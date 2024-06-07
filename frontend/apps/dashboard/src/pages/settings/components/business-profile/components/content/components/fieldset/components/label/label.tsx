import { IcoPencil16 } from '@onefootprint/icons';
import { RoleScopeKind } from '@onefootprint/types';
import { IconButton, Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import PermissionGate from 'src/components/permission-gate';

export type LabelProps = {
  children: string;
  cta?: {
    label: string;
    onClick: () => void;
  };
};

const Label = ({ children, cta }: LabelProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.settings.business-profile',
  });

  return (
    <Stack align="center" gap={3} height="32px">
      <Text variant="label-3" color="tertiary">
        {children}
      </Text>
      {cta && (
        <PermissionGate scopeKind={RoleScopeKind.orgSettings} fallbackText={t('not-allowed')}>
          <IconButton aria-label={cta.label} onClick={cta.onClick}>
            <IcoPencil16 />
          </IconButton>
        </PermissionGate>
      )}
    </Stack>
  );
};

export default Label;
