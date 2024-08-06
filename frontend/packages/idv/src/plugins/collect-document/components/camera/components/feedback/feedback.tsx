import { Text } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

import type { DeviceKind } from '../../types';

type FeedbackProps = {
  children: string;
  deviceKind: DeviceKind;
  top: number;
};

const Feedback = ({ children, deviceKind, top }: FeedbackProps) => (
  <Container data-device={deviceKind} $top={top}>
    <FeedbackText>
      <Text variant="label-4" color="quinary">
        {children}
      </Text>
    </FeedbackText>
  </Container>
);

const Container = styled.div<{ $top: number }>`
  ${({ $top }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    width: 100%;
    top: ${$top}px;
  `}
`;

const FeedbackText = styled.div`
  ${({ theme }) => css`
    background: rgba(0, 0, 0, 0.5);
    z-index: 1;
    padding: ${theme.spacing[3]} ${theme.spacing[4]} ${theme.spacing[3]}
      ${theme.spacing[4]};
    border-radius: ${theme.borderRadius.default};
    text-align: center;
  `}
`;

export default Feedback;
