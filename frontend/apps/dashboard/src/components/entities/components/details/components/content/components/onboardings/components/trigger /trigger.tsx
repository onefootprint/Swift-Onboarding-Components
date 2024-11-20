import { IcoChevronDown16 } from '@onefootprint/icons';
import { Dropdown, Stack, Text } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

type TriggerProps = {
  isOpen: boolean;
  value: string;
};

export const Trigger = ({ isOpen, value }: TriggerProps) => {
  return (
    <Dropdown.Trigger asChild>
      <Container tag="button">
        <Text variant="label-3" tag="h2">
          {value}
        </Text>
        <IconContainer align="center" data-is-open={isOpen} justify="center">
          <IcoChevronDown16 />
        </IconContainer>
      </Container>
    </Dropdown.Trigger>
  );
};

const Container = styled(Stack)`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[3]};
  `}
`;

const IconContainer = styled(Stack)`
  transition: transform 0.1s ease;

  &[data-is-open='true'] {
    transform: rotate(180deg);
  }
`;

export default Trigger;
