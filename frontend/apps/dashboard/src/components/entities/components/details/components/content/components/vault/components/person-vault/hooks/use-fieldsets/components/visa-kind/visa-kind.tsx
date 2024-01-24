import type { DataIdentifier, Entity, VaultValue } from '@onefootprint/types';
import { isVaultDataDecrypted } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { EncryptedCell } from 'src/components';

import Field from '../../../../../field';

export type VisaKindType = {
  di: DataIdentifier;
  entity: Entity;
};

const VisaKind = ({ di, entity }: VisaKindType) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.user.vault' });
  return (
    <Field
      di={di}
      entity={entity}
      renderValue={(value: VaultValue) => {
        if (value && isVaultDataDecrypted(value)) {
          return (
            <Typography variant="body-3" color="primary">
              {t(`us-legal-status.visa-kind.${value}` as ParseKeys<'common'>)}
            </Typography>
          );
        }
        return <EncryptedCell />;
      }}
    />
  );
};

export default VisaKind;
