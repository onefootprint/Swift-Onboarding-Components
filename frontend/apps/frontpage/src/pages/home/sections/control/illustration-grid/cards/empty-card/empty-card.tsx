import { media, Stack } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

type EmptyCardProps = {
  width?: string;
  height?: string;
};

const EmptyCard = styled(Stack)<EmptyCardProps>`
  ${({ width = '100%', height = '100%', theme }) => css`
    display: none;
    width: ${width};
    height: ${height};
    flex-shrink: 0;
    border: ${theme.borderWidth[1]} dashed ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    background-color: var(--custom-gray);

    ${media.greaterThan('md')`
      display: flex;
    `}
  `}
`;

export default EmptyCard;
