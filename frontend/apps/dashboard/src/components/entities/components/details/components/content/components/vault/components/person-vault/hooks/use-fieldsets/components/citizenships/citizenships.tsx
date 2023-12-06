import type { DataIdentifier, Entity, VaultValue } from '@onefootprint/types';
import { isVaultDataDecrypted } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import { EncryptedCell } from 'src/components';

import Field from '../../../../../field';
import getFormattedCountryLabels from '../utils/get-formatted-country-labels';

export type CitizenshipsType = {
  di: DataIdentifier;
  entity: Entity;
};

const Citizenships = ({ di, entity }: CitizenshipsType) => (
  <Field
    di={di}
    entity={entity}
    renderValue={(value: VaultValue) => {
      if (value && isVaultDataDecrypted(value)) {
        const citizenships = getFormattedCountryLabels(value);
        return (
          <Typography variant="body-3" color="primary">
            {citizenships}
          </Typography>
        );
      }
      return <EncryptedCell />;
    }}
  />
);
export default Citizenships;
