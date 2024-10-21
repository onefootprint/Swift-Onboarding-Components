import type { DataIdentifier, Entity } from '@onefootprint/types';
import { IdDI } from '@onefootprint/types';
import { Flag, Text } from '@onefootprint/ui';
import { EncryptedCell } from 'src/components';
import styled, { css } from 'styled-components';

import hasDataIdentifier from 'src/utils/has-data-identifier';
import Field from '../../../../../field';
import checkCountryCode from '../utils/check-country-code';
import getInitialCountry from '../utils/get-initial-country';

export type NationalityType = {
  di: DataIdentifier;
  entity: Entity;
};

const Nationality = ({ di, entity }: NationalityType) => {
  // Do not display Nationality if there is a legal status
  const hasLegalStatusCountry = hasDataIdentifier(entity, IdDI.usLegalStatus);
  if (!hasDataIdentifier(entity, IdDI.nationality) && !hasLegalStatusCountry) {
    return null;
  }

  return (
    <Field
      di={di}
      entity={entity}
      renderValue={value => {
        // @ts-expect-error: Argument of type 'VaultValue' is not assignable to parameter of type 'string | null | undefined'.
        if (checkCountryCode(value)) {
          return (
            <FlagContainer>
              <Flag code={value} />
              <Text variant="body-3" color="primary">
                {getInitialCountry(value).label}
              </Text>
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
