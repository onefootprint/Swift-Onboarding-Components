import styled, { css } from 'styled-components';
import type { StepperStatus } from '../../stepper.types';
import Dot from './components/dot/dot';
import Label from './components/label/label';

type ItemProps = {
  status: StepperStatus;
  onClick: () => void;
  position: number;
  children: string;
  isLastItem?: boolean;
  hasSubOptions?: boolean;
};

const Item = ({ children, status, position, onClick, isLastItem, hasSubOptions }: ItemProps) => {
  const showLineContainer = !isLastItem || (isLastItem && hasSubOptions);
  return (
    <li>
      <Container type="button" onClick={onClick} $disabled={status === 'next'}>
        <Dot status={status} position={position} />
        <Label status={status}>{children}</Label>
      </Container>
      {showLineContainer && (
        <LineContainer>
          <Line />
        </LineContainer>
      )}
    </li>
  );
};

const Container = styled.button<{ $disabled: boolean }>`
  ${({ theme, $disabled }) => css`
    all: unset;
    display: flex;
    align-items: center;
    gap: ${theme.spacing[5]};
    cursor: ${$disabled ? 'not-allowed' : 'pointer'};

    &[data-disabled='true'] {
      pointer-events: none;
    }
  `}
`;

const Line = styled.div`
  ${({ theme }) => css`
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    height: ${theme.spacing[4]};
    width: ${theme.spacing[1]};
    background-color: ${theme.color.secondary};
  `}
`;

const LineContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    position: relative;
    align-items: center;
    justify-content: center;
    width: ${theme.spacing[6]};
    height: ${theme.spacing[4]};
    margin: ${theme.spacing[1]} 0;
  `}
`;

export default Item;
