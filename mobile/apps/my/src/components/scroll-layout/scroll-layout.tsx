import styled, { css } from '@onefootprint/styled';
import { Container } from '@onefootprint/ui';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ScrollLayout = ({ children, Footer }) => {
  const { bottom } = useSafeAreaInsets();

  return (
    <>
      <StyledContainer scroll>{children}</StyledContainer>
      <StickyFooter bottom={bottom}>{Footer}</StickyFooter>
    </>
  );
};

const StyledContainer = styled(Container)`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[4]};
    margin-top: -${theme.spacing[7]};
  `}
`;

const StickyFooter = styled.View<{ bottom: number }>`
  ${({ theme, bottom }) => css`
    background-color: ${theme.backgroundColor.primary}};
    border-color: ${theme.borderColor.primary};
    border-top-width: ${theme.borderWidth[1]};
    bottom: 0;
    padding-bottom: ${bottom + bottom / 2}px;
    padding-horizontal: ${theme.spacing[5]};
    padding-top: ${theme.spacing[5]};
    position: absolute;
    width: 100%;
  `}
`;

export default ScrollLayout;
