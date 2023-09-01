import { useTranslation } from '@onefootprint/hooks';
import { DataIdentifier, Entity, IdDI } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import { EncryptedCell } from 'src/components';

import Field from '../../../../../field';
import checkCountryCode from '../utils/check-country-code';
import getInitialCountry from '../utils/get-initial-country';

export type CountryOfBirthType = {
  di: DataIdentifier;
  entity: Entity;
};

const CountryOfBirth = ({ di, entity }: CountryOfBirthType) => {
  const { t } = useTranslation('di');

  const hasNationality = entity.attributes.includes(IdDI.nationality);
  return hasNationality ? (
    <Field
      di={di}
      entity={entity}
      renderValue={value => {
        if (checkCountryCode(value)) {
          return (
            <Typography variant="body-3" color="primary">
              {getInitialCountry(value).label}
            </Typography>
          );
        }
        return <EncryptedCell />;
      }}
      renderLabel={() => t('id.country_of_birth')}
    />
  ) : null;
};

export default CountryOfBirth;
