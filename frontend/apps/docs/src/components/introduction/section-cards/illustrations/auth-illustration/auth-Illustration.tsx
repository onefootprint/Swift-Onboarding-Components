import { primitives } from '@onefootprint/design-tokens';
import { Stack } from '@onefootprint/ui';
import uniqueId from 'lodash/uniqueId';
import styled, { css } from 'styled-components';

import Line from '../components/line';
import Background from './components/background';

type AuthIllustrationProps = {
  isHovered?: boolean;
};

const AuthIllustration = ({ isHovered = false }: AuthIllustrationProps) => (
  <Container>
    <StyledBackground isHovered={isHovered} />
    <Sheet $isHovered={isHovered}>
      <Line darkColor={primitives.Gray700} lightColor={primitives.Gray100} top="20px" left="50%" width={80} />
      <Line darkColor={primitives.Gray800} lightColor={primitives.Gray50} top="40px" left="50%" width={150} />
      <CodeBox
        gap={3}
        align="center"
        justify="center"
        height="fit-content"
        width="fit-content"
        borderRadius="sm"
        padding={3}
      >
        {Array.from({ length: 6 }).map(() => (
          <CodeBoxItem key={uniqueId()} />
        ))}
      </CodeBox>
      <Line
        darkColor={primitives.Purple300}
        lightColor={primitives.Purple200}
        top="124px"
        left="50%"
        width={60}
        height={16}
      />
    </Sheet>
  </Container>
);

const CodeBox = styled(Stack)`
  ${({ theme }) => css`
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.05) inset;
    background-color: ${theme.backgroundColor.secondary};
    top: 60%;
    left: 50%;
    transform: translate(-50%, -50%);
  `}
`;

const CodeBoxItem = styled(Stack)`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.senary};
    height: ${theme.spacing[6]};
    width: ${theme.spacing[6]};
    border-radius: ${theme.borderRadius.sm};
  `}
`;

const StyledBackground = styled(Background)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: scale(0.9);
`;

const Sheet = styled.div<{ $isHovered?: boolean }>`
  ${({ theme, $isHovered }) => css`
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    width: 240px;
    height: 140px;
    position: absolute;
    box-shadow: ${theme.elevation[1]};
    left: 50%;
    transform: translateX(-50%);
    transition: box-shadow 0.2s ease-in-out;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};

    ${
      $isHovered &&
      css`
      box-shadow: ${theme.elevation[3]};
    `
    }
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
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

export default AuthIllustration;
