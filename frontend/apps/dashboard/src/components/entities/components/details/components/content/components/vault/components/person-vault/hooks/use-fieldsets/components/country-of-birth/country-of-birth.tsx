import type { CountryCode, DataIdentifier, Entity } from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import { EncryptedCell } from 'src/components';

import Field from '../../../../../field';
import checkCountryCode from '../utils/check-country-code';
import getInitialCountry from '../utils/get-initial-country';

export type CountryOfBirthType = {
  di: DataIdentifier;
  entity: Entity;
};

const CountryOfBirth = ({ di, entity }: CountryOfBirthType) => {
  const { t } = useTranslation('common', { keyPrefix: 'di' });

  return (
    <Field
      di={di}
      entity={entity}
      renderValue={value => {
        if (checkCountryCode(value as string)) {
          return (
            <Text variant="body-3" color="primary">
              {getInitialCountry(value as CountryCode).label}
            </Text>
          );
        }
        return <EncryptedCell />;
      }}
      renderLabel={() => t('id.country_of_birth')}
    />
  );
};

export default CountryOfBirth;
