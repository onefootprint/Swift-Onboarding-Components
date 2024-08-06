import styled, { css } from 'styled-components';

import Line from '../components/line';
import Background from './components/background';

type KybIllustrationProps = {
  isHovered?: boolean;
};

const KybIllustration = ({ isHovered = false }: KybIllustrationProps) => (
  <Container>
    <StyledBackground isHovered={isHovered} />
    <CardBack $isHovered={isHovered}>
      <Dots>
        <Line darkColor="#303030" lightColor="#CDCDCD" top="10px" left="0%" width={10} height={10} />
        <Line darkColor="#303030" lightColor="#CDCDCD" top="10px" left="50%" width={10} height={10} />
        <Line darkColor="#303030" lightColor="#CDCDCD" top="10px" left="100%" width={10} height={10} />
      </Dots>
      <Screen>
        <Line darkColor="#303030" lightColor="#CDCDCD" top="40px" left="50%" width={80} />
        <Line darkColor="#303030" lightColor="#CDCDCD" top="60px" left="50%" width={100} />
        <Line darkColor="#303030" lightColor="#CDCDCD" top="90px" left="20%" width={10} />
        <Line darkColor="#303030" lightColor="#CDCDCD" top="90px" left="50%" width={120} />
      </Screen>
    </CardBack>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    isolation: isolate;
    width: 100%;
    height: 100%;
    position: relative;
    padding: ${theme.spacing[7]} ${theme.spacing[8]} 0 ${theme.spacing[8]};
    background: linear-gradient(
      180deg,
      ${theme.backgroundColor.primary} 0%,
      #fffaed40 200%
    );
  `}
`;

const StyledBackground = styled(Background)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
`;

const Dots = styled.div`
  position: absolute;
  top: 0;
  left: 16px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 2px;
  width: 32px;
  height: 30px;
`;

const CardBack = styled.div<{ $isHovered: boolean }>`
  ${({ theme, $isHovered }) => css`
    z-index: 1;
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 7px;
    background: radial-gradient(
      100% 100% at 50% 80%,
      ${theme.backgroundColor.secondary} 0%,
      ${theme.backgroundColor.primary} 100%
    );
    padding: ${theme.spacing[8]} ${theme.spacing[6]} 0 ${theme.spacing[6]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    box-shadow: ${$isHovered ? theme.elevation[3] : theme.elevation[1]};
    transform: translateY(${$isHovered ? '-2px' : 0}) scale(1.1);
    transition: all 0.3s ease-in-out;
  `}
`;

const Screen = styled.div`
  ${({ theme }) => css`
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: 6px;
    background-color: ${theme.backgroundColor.primary};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;

export default KybIllustration;
