import type { DataIdentifier, Entity, VaultValue } from '@onefootprint/types';
import { isVaultDataDecrypted } from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
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
          <Text variant="body-3" color="primary">
            {citizenships}
          </Text>
        );
      }
      return <EncryptedCell />;
    }}
  />
);
export default Citizenships;
