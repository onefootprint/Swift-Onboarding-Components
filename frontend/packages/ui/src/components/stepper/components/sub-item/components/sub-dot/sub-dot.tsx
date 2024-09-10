import styled, { css } from 'styled-components';
import Stack from '../../../../../stack';
import type { StepperStatus } from '../../../../stepper.types';

type SubDotProps = {
  status: StepperStatus;
};

const SubDot = ({ status }: SubDotProps) => {
  return (
    <Stack direction="row" alignItems="center" justifyContent="center" width="20px" height="14px">
      <SmallDot $status={status} />
    </Stack>
  );
};

const SmallDot = styled.div<{ $status: StepperStatus }>`
  ${({ theme, $status }) => css`
    background-color: ${$status === 'selected' || $status === 'completed' ? theme.backgroundColor.accent : theme.backgroundColor.tertiary};
    border-radius: ${theme.borderRadius.full};
    height: 6px;
    width: 6px;
  `};
`;

export default SubDot;
