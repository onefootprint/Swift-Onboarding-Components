import { COUNTRIES, DEFAULT_COUNTRY } from '@onefootprint/global-constants';
import {
  CountryCode,
  DataIdentifier,
  Entity,
  IdDI,
  isCountryCode,
} from '@onefootprint/types';
import { Flag, Typography } from '@onefootprint/ui';
import React from 'react';
import { EncryptedCell } from 'src/components';
import styled, { css } from 'styled-components';

import Field from '../../../../../field';

export type NationalityType = {
  di: DataIdentifier;
  entity: Entity;
};

const checkCountryCode = (value: any): value is CountryCode => {
  if (!value) return false;
  return isCountryCode(value);
};

const getInitialCountry = (initialCountryCode?: CountryCode) => {
  if (initialCountryCode) {
    const possibleCountry = COUNTRIES.find(
      country => country.value === initialCountryCode,
    );
    return possibleCountry || DEFAULT_COUNTRY;
  }
  return DEFAULT_COUNTRY;
};

const Nationality = ({ di, entity }: NationalityType) => {
  if (!entity.attributes.includes(IdDI.nationality)) {
    return null;
  }
  return (
    <Field
      di={di}
      entity={entity}
      renderValue={value => {
        if (checkCountryCode(value)) {
          return (
            <FlagContainer>
              <Flag code={value} />
              <Typography variant="body-3" color="primary">
                {getInitialCountry(value).label}
              </Typography>
            </FlagContainer>
          );
        }
        return <EncryptedCell />;
      }}
    />
  );
};

const FlagContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: ${theme.spacing[4]};
  `}
`;

export default Nationality;
