import * as RadixPopover from '@radix-ui/react-popover';
import styled from 'styled-components';

export type PopoverTriggerProps = RadixPopover.PopoverTriggerProps & {
  children: React.ReactNode;
};

const PopoverTrigger = ({ children, ...props }: PopoverTriggerProps) => {
  return <StyledTrigger {...props}>{children}</StyledTrigger>;
};

const StyledTrigger = styled(RadixPopover.Trigger)`
  all: unset;
  cursor: pointer;
  
  a,
  p {
    text-decoration: underline;
  }
`;

export default PopoverTrigger;
