import { Text } from '@onefootprint/ui';
import { Dropdown } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

type UserNameProps = {
  name?: string | null;
  lastName?: string | null;
  email?: string | null;
};

const UserName = ({ name, lastName, email }: UserNameProps) => {
  const hasName = name || lastName;

  return (
    <UserDropdownItem>
      {hasName && (
        <Text variant="label-3" truncate>
          {name} {lastName}
        </Text>
      )}
      <Text variant={!hasName ? 'label-3' : 'body-3'} color={!hasName ? 'primary' : 'secondary'} truncate>
        {email}
      </Text>
    </UserDropdownItem>
  );
};

const UserDropdownItem = styled(Dropdown.Item)`
  ${({ theme }) => css`
    align-items: flex-start;
    flex-direction: column;
    height: 64px;
    overflow: hidden;
    padding: ${theme.spacing[4]} ${theme.spacing[5]};
    pointer-events: none;
    width: 100%;
    user-select: none;

    & > * {
      max-width: 100%;
    }
  `};
`;

export default UserName;
