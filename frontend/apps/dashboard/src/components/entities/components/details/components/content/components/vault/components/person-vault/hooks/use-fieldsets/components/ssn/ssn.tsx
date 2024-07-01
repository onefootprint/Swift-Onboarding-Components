import type { DataIdentifier, Entity } from '@onefootprint/types';
import { IdDI, isVaultDataDecrypted, isVaultDataText } from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import React from 'react';
import { EncryptedCell } from 'src/components';

import Field from '../../../../../field';
import ssnFormatter from './utils/ssn-formatter';

export type SSNType = {
  di: DataIdentifier;
  entity: Entity;
};

const SSN = ({ di, entity }: SSNType) =>
  entity.attributes.includes(di) ? (
    <Field
      di={di}
      entity={entity}
      renderValue={value => {
        if (isVaultDataDecrypted(value) && isVaultDataText(value)) {
          return (
            <Text variant="body-3" color="primary">
              {di === IdDI.ssn4 ? value : ssnFormatter(value)}
            </Text>
          );
        }
        return <EncryptedCell />;
      }}
    />
  ) : null;

export default SSN;
