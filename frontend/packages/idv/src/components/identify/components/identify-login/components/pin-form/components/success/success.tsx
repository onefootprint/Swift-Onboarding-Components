import { SuccessCheck, Text } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

const Success = ({ text }: { text: string }) => (
  <Container>
    <SuccessCheck animationStart size={32} />
    <Text variant="label-3" color="success">
      {text}
    </Text>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100px;
    gap: ${theme.spacing[4]};
  `}
`;

export default Success;
