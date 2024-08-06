import { STATES } from '@onefootprint/global-constants';
import type { DataIdentifier, Entity, VaultValue } from '@onefootprint/types';
import { isVaultDataDecrypted, isVaultDataText } from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import { EncryptedCell } from 'src/components';

import Field from '../../../../../field';

export type StateType = {
  di: DataIdentifier;
  entity: Entity;
};

const getState = (state: VaultValue) => {
  const possibleState = STATES.find(s => s.value === state);
  return possibleState?.label || (state as string);
};

const State = ({ di, entity }: StateType) => (
  <Field
    di={di}
    entity={entity}
    renderValue={value => {
      if (value && isVaultDataText(value) && isVaultDataDecrypted(value)) {
        return (
          <Text variant="body-3" color="primary">
            {getState(value)}
          </Text>
        );
      }
      return <EncryptedCell />;
    }}
  />
);

export default State;
