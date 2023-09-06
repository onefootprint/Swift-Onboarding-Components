import styled, { css } from '@onefootprint/styled';
import type { DataIdentifier, Entity } from '@onefootprint/types';
import { IdDI } from '@onefootprint/types';
import { Flag, Typography } from '@onefootprint/ui';
import React from 'react';
import { EncryptedCell } from 'src/components';

import Field from '../../../../../field';
import checkCountryCode from '../utils/check-country-code';
import getInitialCountry from '../utils/get-initial-country';

export type NationalityType = {
  di: DataIdentifier;
  entity: Entity;
};

const Nationality = ({ di, entity }: NationalityType) => {
  // Do not display Nationality if there is a legal status
  const hasLegalStatusCountry = entity.attributes.includes(IdDI.usLegalStatus);
  if (!entity.attributes.includes(IdDI.nationality) && !hasLegalStatusCountry) {
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
