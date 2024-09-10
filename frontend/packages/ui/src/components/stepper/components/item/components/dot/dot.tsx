import { IcoCheckSmall16 } from '@onefootprint/icons';
import { css, styled } from 'styled-components';
import Stack from '../../../../../stack';
import Text from '../../../../../text';
import type { StepperStatus } from '../../../../stepper.types';

type DotProps = {
  status: StepperStatus;
  position: number;
};

const Dot = ({ status, position }: DotProps) => {
  return (
    <Container $status={status}>
      {status === 'completed' ? (
        <IcoCheckSmall16 color="quinary" />
      ) : (
        <Text variant="caption-3" color="quinary">
          {position}
        </Text>
      )}
    </Container>
  );
};

const Container = styled(Stack)<{ $status: StepperStatus }>`
  ${({ theme, $status }) => css`
    width: ${theme.spacing[6]};
    height: ${theme.spacing[6]};
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: ${theme.borderRadius.full};

    ${
      $status === 'completed' &&
      css`
      background-color: ${theme.backgroundColor.successInverted};
    `
    }

    ${
      $status === 'next' &&
      css`
      background-color: ${theme.backgroundColor.tertiary};
    `
    }

    ${
      $status === 'selected' &&
      css`
      background-color: ${theme.backgroundColor.accent};
    `
    }
  `}
`;

export default Dot;
