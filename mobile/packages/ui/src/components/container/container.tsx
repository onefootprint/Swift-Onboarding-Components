import styled, { css } from '@onefootprint/styled';
import React from 'react';

export type ContainerProps = {
  center?: boolean;
  children?: React.ReactNode;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  scroll?: boolean;
};

const Container = ({
  center = false,
  children,
  keyboardShouldPersistTaps,
  scroll,
}: ContainerProps) => {
  return (
    <Wrapper>
      {scroll ? (
        <InnerWithScrolling
          center={center}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        >
          {children}
        </InnerWithScrolling>
      ) : (
        <InnerWithoutScrolling center={center}>
          {children}
        </InnerWithoutScrolling>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.SafeAreaView`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    width: 100%;
    height: 100%;
  `}
`;

const InnerWithoutScrolling = styled.View<{ center: boolean }>`
  ${({ theme }) => css`
    flex: 1;
    padding-horizontal: ${theme.spacing[5]};
    padding-vertical: ${theme.spacing[7]};
  `}
  ${({ center }) =>
    center &&
    css`
      align-items: center;
      justify-content: center;
    `}
`;

const InnerWithScrolling = styled.ScrollView<{ center: boolean }>`
  ${({ theme }) => css`
    flex: 1;
    padding-horizontal: ${theme.spacing[5]};
    padding-vertical: ${theme.spacing[7]};
  `}
  ${({ center }) =>
    center &&
    css`
      align-items: center;
      justify-content: center;
    `}
`;

export default Container;
