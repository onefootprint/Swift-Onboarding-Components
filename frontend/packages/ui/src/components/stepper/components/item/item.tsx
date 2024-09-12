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
  disabled?: boolean;
};

const Item = ({ children, status, position, onClick, isLastItem, hasSubOptions, disabled }: ItemProps) => {
  const showLineContainer = !isLastItem || (isLastItem && hasSubOptions);
  return (
    <li>
      <Container type="button" onClick={onClick} data-disabled={disabled}>
        <Dot status={status} position={position} />
        <Label status={status}>{children}</Label>
      </Container>
      {showLineContainer && (
        <LineContainer>
          <Line status={status} />
        </LineContainer>
      )}
    </li>
  );
};

const Container = styled.button`
  ${({ theme }) => css`
    all: unset;
    display: flex;
    align-items: center;
    gap: ${theme.spacing[5]};
    cursor: pointer;
    pointer-events: auto;
    
    &[data-disabled='true'] {
      cursor: initial;
      pointer-events: none;
    }
  `}
`;

const Line = styled.div<{ status: StepperStatus }>`
  ${({ theme, status }) => {
    const getLineColor = () => {
      if (status === 'completed') {
        return theme.color.success;
      }
      if (status === 'selected') {
        return theme.color.accent;
      }
      return theme.color.secondary;
    };
    return css`
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    height: ${theme.spacing[4]};
    width: ${theme.spacing[1]};
    background-color: ${getLineColor()};
    border-radius: ${theme.borderRadius.full};
  `;
  }}
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
