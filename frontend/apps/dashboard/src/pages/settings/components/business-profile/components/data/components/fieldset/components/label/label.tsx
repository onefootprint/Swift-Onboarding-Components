import { useTranslation } from '@onefootprint/hooks';
import { IcoPencil16 } from '@onefootprint/icons';
import { RoleScope } from '@onefootprint/types';
import { Box, IconButton, Typography } from '@onefootprint/ui';
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
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        gap: 3,
        height: '32px',
        marginBottom: 2,
      }}
    >
      <Typography variant="label-3" color="tertiary">
        {children}
      </Typography>
      {cta && (
        <PermissionGate
          scope={RoleScope.orgSettings}
          fallbackText={t('not-allowed')}
        >
          <IconButton aria-label={cta.label} onClick={cta.onClick}>
            <IcoPencil16 />
          </IconButton>
        </PermissionGate>
      )}
    </Box>
  );
};

export default Label;
