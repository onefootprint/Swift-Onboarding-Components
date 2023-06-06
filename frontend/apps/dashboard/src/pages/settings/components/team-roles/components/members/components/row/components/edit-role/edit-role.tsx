import { useTranslation } from '@onefootprint/hooks';
import { IcoCheck16, IcoChevronDown16 } from '@onefootprint/icons';
import { Member } from '@onefootprint/types';
import { createFontStyles } from '@onefootprint/ui';
import * as Select from '@radix-ui/react-select';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import useRoles from '../../../../hooks/use-roles';
import ScopesList from './components/scopes';
import useUpdateMember from './hooks/use-update-member';

export type EditRoleProps = {
  member: Member;
};

const EditRole = ({ member }: EditRoleProps) => {
  const { t } = useTranslation('pages.settings.members.edit-role');
  const [value, setValue] = useState({
    id: member.role.id,
    name: member.role.name,
  });
  const rolesQuery = useRoles();
  const updateMemberMutation = useUpdateMember(member.id);

  const handleChange = (roleId: string) => {
    // We do a optimisc update, if the mutation fails we revert the value
    const newRole = rolesQuery.data?.find(role => role.id === roleId);
    if (newRole) {
      setValue({ id: newRole.id, name: newRole.name });
      updateMemberMutation.mutate(
        { roleId },
        {
          onError: () => {
            setValue({
              id: member.role.id,
              name: member.role.name,
            });
          },
        },
      );
    }
  };

  return (
    <Select.Root value={value.id} onValueChange={handleChange}>
      <Trigger aria-label={t('aria-label', { email: member.email })}>
        <Select.Value>{value.name}</Select.Value>
        <IcoChevronDown16 />
      </Trigger>
      <Content position="popper" sideOffset={5}>
        <Select.Viewport>
          {rolesQuery.data?.map(role => (
            <Item value={role.id} textValue={role.name} key={role.id}>
              <Select.ItemText>
                <Name>{role.name}</Name>
                <Scopes aria-hidden>
                  <ScopesList scopes={role.scopes} />
                </Scopes>
              </Select.ItemText>
              <Select.ItemIndicator>
                <IcoCheck16 />
              </Select.ItemIndicator>
            </Item>
          ))}
        </Select.Viewport>
        <Select.ScrollDownButton />
      </Content>
    </Select.Root>
  );
};

const Trigger = styled(Select.Trigger)`
  ${({ theme }) => css`
    ${createFontStyles('body-3')};
    align-items: center;
    background: unset;
    border: unset;
    cursor: pointer;
    display: flex;
    gap: ${theme.spacing[2]};
    padding: unset;
  `}
`;

const Content = styled(Select.Content)`
  ${({ theme }) => {
    const { dropdown } = theme.components;

    return css`
      background: ${dropdown.bg};
      border-radius: ${dropdown.borderRadius};
      border: ${dropdown.borderWidth} solid ${dropdown.borderColor}};
      box-shadow: ${dropdown.elevation};
      max-height: 380px;
      overflow: hidden;
      width: 360px;
    `;
  }}
`;

const Item = styled(Select.Item)`
  ${({ theme }) => {
    const { dropdown } = theme.components;

    return css`
      align-items: center;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      outline: none;
      padding: ${theme.spacing[3]} ${theme.spacing[5]};

      &[data-highlighted] {
        background: ${dropdown.hover.bg};
      }

      @media (hover: hover) {
        &:hover {
          background: ${dropdown.hover.bg};
        }
      }

      > span:first-of-type {
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing[1]};
      }
    `;
  }}
`;

const Name = styled.span`
  ${({ theme }) => css`
    ${createFontStyles('body-3')};
    color: ${theme.color.primary};
  `}
`;

const Scopes = styled.span`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    ${createFontStyles('body-4')};
    gap: ${theme.spacing[2]};
    color: ${theme.color.tertiary};

    span:not(:last-child)::after {
      content: ';';
    }
  `}
`;

export default EditRole;
