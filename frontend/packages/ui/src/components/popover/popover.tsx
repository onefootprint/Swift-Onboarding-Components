import { IcoCloseSmall16 } from '@onefootprint/icons';
import * as RadixPopover from '@radix-ui/react-popover';
import styled, { css, keyframes } from 'styled-components';

export type PopoverProps = {
  content: React.ReactNode;
  children: string | React.ReactNode;
  align?: 'start' | 'end' | 'center';
  side?: 'top' | 'bottom' | 'left' | 'right';
};

const Popover = ({ content, children, align, side = 'top' }: PopoverProps) => {
  return (
    <RadixPopover.Root>
      <StyledTrigger asChild>{children}</StyledTrigger>
      <RadixPopover.Portal>
        <StyledContent align={align} side={side} sideOffset={8}>
          <CloseButtonContainer>
            <IcoCloseSmall16 />
          </CloseButtonContainer>
          {content}
        </StyledContent>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
};

const CloseButtonContainer = styled(RadixPopover.Close)`
  ${({ theme }) => css`
    all: unset;
    width: ${theme.spacing[5]};
    height: ${theme.spacing[5]};
    position: absolute;
    top: ${theme.spacing[3]};
    right: ${theme.spacing[3]};
    cursor: pointer;

    &:hover {
      opacity: 0.6;
    }
  `}
`;

const StyledTrigger = styled(RadixPopover.Trigger)`
  cursor: pointer;
  text-decoration: underline;
`;

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(-8px);

  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const StyledContent = styled(RadixPopover.Content)`
${({ theme }) => css`
  min-width: 240px;
  max-width: 380px;
  transform-origin: var(--radix-popover-content-transform-origin);
  background-color: ${theme.backgroundColor.primary};
  border-radius: ${theme.borderRadius.default};
  padding: ${theme.spacing[4]} ${theme.spacing[7]} ${theme.spacing[4]} ${theme.spacing[4]};
  box-shadow: ${theme.elevation[2]};

  &[data-side='top'] {
    animation: ${fadeDown} 200ms ease-in-out;
  }

  &[data-side='bottom'] {
    animation: ${fadeUp} 200ms ease-in-out;
  }
`}

`;

export default Popover;
