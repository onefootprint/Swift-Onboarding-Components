import { IcoChevronDown16 } from '@onefootprint/icons';
import * as RadixSelect from '@radix-ui/react-select';
import styled, { css } from 'styled-components';

const ScrollButton = ({ direction }: { direction: 'up' | 'down' }) => {
  const ButtonComponent = direction === 'up' ? RadixSelect.ScrollUpButton : RadixSelect.ScrollDownButton;
  return (
    <ButtonComponent asChild>
      <Container $direction={direction}>
        <IcoChevronDown16 />
      </Container>
    </ButtonComponent>
  );
};

const Container = styled.div<{ $direction: 'up' | 'down' }>`
  ${({ theme, $direction }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    cursor: pointer;
    transform: ${$direction === 'up' ? 'rotate(180deg)' : 'none'};
    height: ${theme.spacing[7]};

    &:hover {
      background-color: ${theme.backgroundColor.secondary};
    }
  `}
`;

export default ScrollButton;
