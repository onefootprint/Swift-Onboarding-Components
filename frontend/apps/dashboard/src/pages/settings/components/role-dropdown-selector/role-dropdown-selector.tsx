import type { RoleScope } from '@onefootprint/types';
import { createFontStyles } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

import type { DropdownSelectorProps, Option } from '../dropdown-selector';
import DropdownSelector from '../dropdown-selector';
import ScopesList from '../team-roles/components/members/components/row/components/edit-role/components/scopes';

export const RoleDropdownSelector = ({
  onValueChange,
  triggerAriaLabel,
  value,
  options,
}: DropdownSelectorProps<RoleScope[]>) => {
  const renderScopes = (item: Option<RoleScope[]>) =>
    item.customData && (
      <Scopes aria-hidden>
        <ScopesList scopes={item.customData} />
      </Scopes>
    );

  return DropdownSelector<RoleScope[]>({
    onValueChange,
    triggerAriaLabel,
    value,
    options,
    renderCustomData: renderScopes,
  });
};

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

export default RoleDropdownSelector;
