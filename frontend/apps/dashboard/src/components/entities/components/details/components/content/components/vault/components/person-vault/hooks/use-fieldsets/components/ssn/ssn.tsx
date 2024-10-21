import type { DataIdentifier, Entity } from '@onefootprint/types';
import { IdDI, isVaultDataDecrypted, isVaultDataText } from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import { EncryptedCell } from 'src/components';

import hasDataIdentifier from 'src/utils/has-data-identifier';
import Field from '../../../../../field';
import ssnFormatter from './utils/ssn-formatter';

export type SSNType = {
  di: DataIdentifier;
  entity: Entity;
};

const SSN = ({ di, entity }: SSNType) =>
  hasDataIdentifier(entity, di) ? (
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
