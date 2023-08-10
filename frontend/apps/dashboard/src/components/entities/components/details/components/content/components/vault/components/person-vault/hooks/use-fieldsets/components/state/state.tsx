import { STATES } from '@onefootprint/global-constants';
import {
  DataIdentifier,
  Entity,
  IdDI,
  isVaultDataDecrypted,
  isVaultDataText,
  VaultValue,
} from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import { EncryptedCell } from 'src/components';

import Field from '../../../../../field';

export type StateType = {
  di: DataIdentifier;
  entity: Entity;
};

const checkStateCode = (value: VaultValue) =>
  isVaultDataText(value) &&
  isVaultDataDecrypted(value) &&
  STATES.some(s => s.value === value);

const getState = (state: VaultValue) => {
  const possibleState = STATES.find(s => s.value === state);
  return possibleState?.label || (state as string);
};

const State = ({ di, entity }: StateType) =>
  entity.attributes.includes(IdDI.state) ? (
    <Field
      di={di}
      entity={entity}
      renderValue={value => {
        if (value && checkStateCode(value)) {
          return (
            <Typography variant="body-3" color="primary">
              {getState(value)}
            </Typography>
          );
        }
        return <EncryptedCell />;
      }}
    />
  ) : null;

export default State;
