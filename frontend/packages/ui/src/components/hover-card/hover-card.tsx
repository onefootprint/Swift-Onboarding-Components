import * as RadixHoverCard from '@radix-ui/react-hover-card';
import styled, { css } from 'styled-components';

const StyledContent = styled(RadixHoverCard.Content)`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    border: 1px solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius[2]}px;
    padding: ${theme.spacing[4]}px;
  `}
`;

const StyledArrow = styled(RadixHoverCard.Arrow)`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
  `}
`;

const HoverCard = {
  Root: RadixHoverCard.Root,
  Trigger: RadixHoverCard.Trigger,
  Portal: RadixHoverCard.Portal,
  Content: StyledContent,
  Arrow: StyledArrow,
};

export default HoverCard;
