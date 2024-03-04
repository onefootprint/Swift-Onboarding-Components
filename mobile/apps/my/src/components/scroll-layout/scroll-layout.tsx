import { Container } from '@onefootprint/ui';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled, { css } from 'styled-components/native';

type ScrollLayoutProps = {
  children: React.ReactNode;
  Footer: React.ReactNode;
};

const ScrollLayout = ({ children, Footer }: ScrollLayoutProps) => {
  const { bottom, top } = useSafeAreaInsets();

  return (
    <>
      <StyledContainer scroll top={top}>
        {children}
      </StyledContainer>
      <StickyFooter bottom={bottom}>{Footer}</StickyFooter>
    </>
  );
};

const StyledContainer = styled(Container)<{ top: number }>`
  ${({ theme, top }) => css`
    margin-bottom: ${top === 0 ? theme.spacing[9] : theme.spacing[4]};
    margin-top: -${top}px;
  `}
`;

const StickyFooter = styled.View<{ bottom: number }>`
  ${({ theme, bottom }) => css`
    background-color: ${theme.backgroundColor.primary};
    border-color: ${theme.borderColor.primary};
    border-top-width: ${theme.borderWidth[1]};
    bottom: 0;
    padding-bottom: ${bottom ? `${bottom + bottom / 2}px` : theme.spacing[5]};
    padding-horizontal: ${theme.spacing[5]};
    padding-top: ${theme.spacing[5]};
    position: absolute;
    width: 100%;
  `}
`;
export default ScrollLayout;
