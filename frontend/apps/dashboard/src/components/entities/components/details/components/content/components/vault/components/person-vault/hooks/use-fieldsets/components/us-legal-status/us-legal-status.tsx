import { useTranslation } from '@onefootprint/hooks';
import {
  DataIdentifier,
  Entity,
  IdDI,
  isVaultDataDecrypted,
  isVaultDataText,
} from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import { EncryptedCell } from 'src/components';

import Field from '../../../../../field';

export type UsLegalStatusType = {
  di: DataIdentifier;
  entity: Entity;
};

const UsLegalStatus = ({ di, entity }: UsLegalStatusType) => {
  const { t } = useTranslation('pages.user.vault');
  return entity.attributes.includes(IdDI.usLegalStatus) ? (
    <Field
      di={di}
      entity={entity}
      renderValue={value => {
        if (isVaultDataDecrypted(value) && isVaultDataText(value)) {
          return (
            <Typography variant="body-3" color="primary">
              {t(`us-legal-status.status.options.${value}`)}
            </Typography>
          );
        }
        return <EncryptedCell />;
      }}
    />
  ) : null;
};

export default UsLegalStatus;
