import type { DataIdentifier } from '@onefootprint/types';
import { isVaultDataEmpty, isVaultDataEncrypted, isVaultDataText } from '@onefootprint/types';
import { Box, LinkButton, Typography } from '@onefootprint/ui';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

import useUserVault from '../../hooks/use-user-vault';

export type FieldProps = {
  di: DataIdentifier;
};

const Field = ({ di }: FieldProps) => {
  const { data } = useUserVault();
  const { t } = useTranslation('di');
  const value = data?.[di];
  const isDataEncrypted = isVaultDataEncrypted(value);

  return (
    <Box>
      <Box flexDirection="row" alignItems="center" marginBottom={2} gap={2}>
        <Typography variant="label-3" color="tertiary">
          {t(di)}
        </Typography>
        {isDataEncrypted && (
          <>
            <Typography variant="label-3" color="tertiary">
              ·
            </Typography>
            <LinkButton size="tiny">Reveal</LinkButton>
          </>
        )}
      </Box>
      {isDataEncrypted && <Typography variant="body-3">•••••••••</Typography>}
      {isVaultDataEmpty(value) && <Typography variant="body-3">-</Typography>}
      {isVaultDataText(value) ? <Typography variant="body-3">{value}</Typography> : null}
    </Box>
  );
};

export default Field;
