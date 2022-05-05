import styled, { css } from 'styled';

export type DropdownProps = {
  children: React.ReactNode;
  testID?: string;
};

const Dropdown = styled('ul').attrs<DropdownProps>(({ testID }) => ({
  'data-testid': testID,
}))<DropdownProps>`
  ${({ theme }) => css`
    background: ${theme.backgroundColors.primary};
    border-radius: ${theme.borderRadius[1]}px;
    border: ${theme.borderWidths[1]}px solid ${theme.borderColors.primary};
    box-shadow: ${theme.elevations[2]};
    max-height: 330px;
    overflow: hidden;
    padding: ${theme.spacings[3]}px 0 0;
    width: 100%;
  `}
`;

export default Dropdown;
