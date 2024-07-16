import React from 'react';
import styled, { css } from 'styled-components/native';

type InlineButtonsLayoutProps = {
  children: React.ReactNode;
};

const InlineButtonsLayout = ({ children }: InlineButtonsLayoutProps) => <Container>{children}</Container>;

const Container = styled.View`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    margin-left: ${theme.spacing[3]};
  `}
`;

export default InlineButtonsLayout;
