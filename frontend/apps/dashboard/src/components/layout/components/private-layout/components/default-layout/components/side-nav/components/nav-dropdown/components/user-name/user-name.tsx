import { Dropdown, Text } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type UserNameProps = {
  name?: string | null;
  lastName?: string | null;
  email?: string | null;
};

const UserName = ({ name, lastName, email }: UserNameProps) => (
  <UserDropdownItem>
    {(name || lastName) && (
      <Text variant="label-3" truncate>
        {name} {lastName}
      </Text>
    )}
    <Text variant="body-3" color="secondary" truncate>
      {email}
    </Text>
  </UserDropdownItem>
);

const UserDropdownItem = styled(Dropdown.Item)`
  ${({ theme }) => css`
    pointer-events: none;
    padding: ${theme.spacing[4]} ${theme.spacing[5]};
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    overflow: hidden;

    & > * {
      max-width: 100%;
    }
  `};
`;

export default UserName;
