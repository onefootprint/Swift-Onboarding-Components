import { IcoFootprint40 } from '@onefootprint/icons';
import { useTheme } from 'next-themes';
import styled, { css } from 'styled-components';

import Background from './components/background';

type VaultProxyIllustrationProps = {
  isHovered?: boolean;
};

const VaultProxyIllustration = ({ isHovered = false }: VaultProxyIllustrationProps) => {
  const theme = useTheme();
  const isDark = theme.theme === 'dark';
  return (
    <Container>
      <StyledBackground isHovered={isHovered} />
      <Knob $isDark={isDark} $isHovered={isHovered}>
        <IcoFootprint40 color={isDark ? 'primary' : 'septenary'} />
      </Knob>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    position: relative;
    height: 100%;
    width: 100%;
    background-color: ${theme.backgroundColor.primary};
    display: flex;
    align-items: center;
    justify-content: center;
  `}
`;

const Knob = styled.div<{ $isDark: boolean; $isHovered: boolean }>`
  ${({ theme, $isDark, $isHovered }) => css`
    position: relative;
    padding: ${theme.spacing[7]};
    border-radius: ${theme.borderRadius.full};
    background: ${theme.backgroundColor.tertiary};
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0px 1px 0px 0px rgba(255, 255, 255, 0.1) inset;
    transition: all 0.2s ease-in-out;

    ${
      $isDark &&
      css`
      box-shadow: 0px 1px 0px 0px rgba(255, 255, 255, 0.08) inset;
      background-color: ${theme.backgroundColor.secondary};
    `
    }

    ${
      $isHovered &&
      css`
      box-shadow: ${theme.elevation[3]};
      transform: translateY(-2px) scale(1.03);
    `
    }
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

export default VaultProxyIllustration;
