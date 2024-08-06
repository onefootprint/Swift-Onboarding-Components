import { IcoDotsHorizontal16 } from '@onefootprint/icons';
import { Dropdown } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

type OverFlowButtonProps = {
  ariaLabel: string;
};

const OverFlowButton = ({ ariaLabel }: OverFlowButtonProps) => (
  <Trigger aria-label={ariaLabel}>
    <IcoDotsHorizontal16 testID="nav-dropdown-button" />
  </Trigger>
);

const Trigger = styled(Dropdown.Trigger)`
  ${({ theme }) => css`
    all: unset;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${theme.spacing[7]};
    height: ${theme.spacing[7]};
    border-radius: calc(${theme.borderRadius.default} - ${theme.spacing[1]});
  `}
`;

export default OverFlowButton;
