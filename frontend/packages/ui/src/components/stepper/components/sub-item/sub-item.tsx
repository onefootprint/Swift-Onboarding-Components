import styled, { css } from 'styled-components';
import type { StepperStatus } from '../../stepper.types';
import SubDot from './components/sub-dot';
import SubLabel from './components/sub-label';

type SubItemProps = {
  status: StepperStatus;
  onClick: () => void;
  children: string;
  isLastOption?: boolean;
};
const SubItem = ({ status, onClick, children, isLastOption }: SubItemProps) => {
  return (
    <li data-status={status}>
      <Container type="button" onClick={onClick}>
        <SubDot status={status} />
        <SubLabel status={status}>{children}</SubLabel>
      </Container>
      {!isLastOption && <LineContainer>{<Line />}</LineContainer>}
    </li>
  );
};

const Container = styled.button`
  ${({ theme }) => css`
    all: unset;
    display: flex;
    align-items: center;
    gap: ${theme.spacing[5]};
  `};
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
export default SubItem;
