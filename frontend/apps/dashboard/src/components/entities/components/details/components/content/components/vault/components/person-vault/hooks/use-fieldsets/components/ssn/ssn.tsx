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
import ssnFormatter from './utils/ssn-formatter';

export type SSNType = {
  di: DataIdentifier;
  entity: Entity;
};

const SSN = ({ di, entity }: SSNType) =>
  entity.attributes.includes(IdDI.ssn9) ? (
    <Field
      di={di}
      entity={entity}
      renderValue={value => {
        if (isVaultDataDecrypted(value) && isVaultDataText(value)) {
          return (
            <Typography variant="body-3" color="primary">
              {ssnFormatter(value)}
            </Typography>
          );
        }
        return <EncryptedCell />;
      }}
    />
  ) : null;

export default SSN;
