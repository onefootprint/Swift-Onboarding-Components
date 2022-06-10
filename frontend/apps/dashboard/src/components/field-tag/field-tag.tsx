import { DataKind } from '@src/pages/users/hooks/use-decrypt-user';
import React from 'react';
import styled, { css } from 'styled-components';
import { Typography } from 'ui';

const dataKindToDisplayName: Record<DataKind, String> = {
  [DataKind.firstName]: 'First name',
  [DataKind.lastName]: 'Last name',
  [DataKind.email]: 'Email',
  [DataKind.phoneNumber]: 'Phone number',
  [DataKind.ssn]: 'SSN',
  [DataKind.dob]: 'Date of birth',
  [DataKind.streetAddress]: 'Address line 1',
  [DataKind.streetAddress2]: 'Address line 2',
  [DataKind.city]: 'City',
  [DataKind.state]: 'State',
  [DataKind.zip]: 'Zip code',
  [DataKind.country]: 'Country',
};

type FieldTagProps = {
  dataKind: DataKind;
};

const FieldTag = ({ dataKind }: FieldTagProps) => (
  <StyledFieldTag>{dataKindToDisplayName[dataKind]}</StyledFieldTag>
);

const StyledFieldTag = styled(Typography).attrs({
  as: 'span',
  variant: 'label-4',
})`
  ${({ theme }) => css`
    color: ${theme.color.neutral};
    background-color: ${theme.backgroundColor.neutral};
    padding: ${theme.spacing[1]}px ${theme.spacing[2]}px;
    border-radius: 4px; // TODO put in design library
  `};
`;

export default FieldTag;
