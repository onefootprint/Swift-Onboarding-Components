import { UserDataAttribute } from '@onefootprint/types';
import { createFontStyles } from '@onefootprint/ui';
import React, { Fragment } from 'react';
import styled, { css } from 'styled-components';

type FieldTagListProps = {
  targets: string[];
};

const dataKindToDisplayName: Record<string, String> = {
  [UserDataAttribute.firstName]: 'First name',
  [UserDataAttribute.lastName]: 'Last name',
  [UserDataAttribute.email]: 'Email',
  [UserDataAttribute.phoneNumber]: 'Phone number',
  [UserDataAttribute.ssn9]: 'SSN',
  [UserDataAttribute.ssn4]: 'SSN (last 4)',
  [UserDataAttribute.dob]: 'Date of birth',
  [UserDataAttribute.addressLine1]: 'Address line 1',
  [UserDataAttribute.addressLine2]: 'Address line 2',
  [UserDataAttribute.city]: 'City',
  [UserDataAttribute.state]: 'State',
  [UserDataAttribute.zip]: 'Zip code',
  [UserDataAttribute.country]: 'Country',
};

const FieldTagList = ({ targets }: FieldTagListProps) => (
  <>
    {targets.map((target: string, i: number) => {
      const parts = target.split('.');
      const prefix = parts[0];
      let text;
      if (prefix === 'identity') {
        const dataAttribute = parts[parts.length - 1];
        text = dataKindToDisplayName[dataAttribute];
      } else if (prefix === 'custom') {
        // TODO better formatting for custom data tags
        text = target;
      } else {
        text = target;
      }
      return (
        // eslint-disable-next-line react/no-array-index-key
        <Fragment key={`${target}-${i}`}>
          <StyledTag>{text}</StyledTag>
          {i !== targets.length - 1 && <span>, </span>}
        </Fragment>
      );
    })}
  </>
);

const StyledTag = styled.span`
  ${({ theme }) => css`
    ${createFontStyles('label-4')};
    background-color: ${theme.backgroundColor.neutral};
    border-radius: ${theme.borderRadius.compact};
    color: ${theme.color.neutral};
    padding: ${theme.spacing[1]} ${theme.spacing[2]};
  `};
`;

export default FieldTagList;
