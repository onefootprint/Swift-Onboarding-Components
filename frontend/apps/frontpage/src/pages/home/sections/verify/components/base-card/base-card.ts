import { Box } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

const BaseCard = styled(Box)<{
  overflow?: 'hidden' | 'visible';
  backgroundImage?: string;
}>`
  ${({ theme, overflow, backgroundImage }) => css`
    position: relative;
    background: ${
      backgroundImage
        ? `linear-gradient(${theme.backgroundColor.primary}, transparent), url(${backgroundImage}), ${theme.backgroundColor.primary}`
        : theme.backgroundColor.primary
    };
    background-size: cover;
    display: flex;
    flex-direction: column;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    overflow: ${overflow};
    gap: ${theme.spacing[2]};
  `}
`;

export default BaseCard;
