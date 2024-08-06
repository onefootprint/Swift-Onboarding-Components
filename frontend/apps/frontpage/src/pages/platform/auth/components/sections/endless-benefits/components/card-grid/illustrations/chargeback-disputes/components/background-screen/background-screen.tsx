import { Stack } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

type BackgroundScreenProps = {
  className?: string;
};

const BackgroundScreen = ({ className }: BackgroundScreenProps) => (
  <Container className={className}>
    <Stack direction="column" align="start">
      <Stack direction="row" gap={2} height="40px" justify="start" align="center" marginLeft={5}>
        <Dot />
        <Dot />
        <Dot />
      </Stack>
    </Stack>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    box-shadow: ${theme.elevation[2]};
    border-radius: 16px;
    width: 400px;
    height: 300px;
    position: relative;

    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url('/auth/grid/graph-paper.svg');
      background-repeat: repeat;
      background-position: center;
      mask: radial-gradient(
        80% 80% at 50% 50%,
        rgba(0, 0, 0, 0.5) 0%,
        transparent 80%
      );
      mask-type: alpha;
    }
  `}
`;

const Dot = styled.div`
  ${({ theme }) => css`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${theme.backgroundColor.senary};
  `}
`;

export default BackgroundScreen;
