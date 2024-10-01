import { createFontStyles } from '@onefootprint/ui';
import * as RadixSelect from '@radix-ui/react-select';
import styled from 'styled-components';
type TriggerProps = RadixSelect.SelectTriggerProps;

const Trigger = ({ children, ...props }: TriggerProps) => {
  return <StyledTrigger {...props}>{children}</StyledTrigger>;
};

const StyledTrigger = styled(RadixSelect.Trigger)`
  all: unset;
  ${createFontStyles('body-3')}
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  .icon-component {
    transform: rotate(0deg);
    transition: transform 0.1s ease-in-out;
  }

  &[data-state='open'] {
    .icon-component {
      transform: rotate(-180deg);
    }
  }
`;

export default Trigger;
