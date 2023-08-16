import styled, { css } from '@onefootprint/styled';

export type DividerProps = {
  variant?: 'primary' | 'secondary';
};

const Divider = styled.div.attrs({
  role: 'separator',
  'aria-orientation': 'horizontal',
})<DividerProps>`
  ${({ theme, variant = 'primary' }) => css`
    border-color: ${theme.borderColor.tertiary};
    border-image: initial;
    border-style: ${variant === 'primary' ? 'solid' : 'dashed'};
    border-width: 0px 0px ${theme.borderWidth[1]};
    opacity: 1;
    width: 100%;
  `}
`;

export default Divider;
