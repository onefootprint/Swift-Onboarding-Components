import React from 'react';
import styled, { css } from 'styled-components';

type InlineButtonsLayoutProps = {
  children: React.ReactNode;
};

const InlineButtonsLayout = ({ children }: InlineButtonsLayoutProps) => <Container>{children}</Container>;

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-left: ${theme.spacing[3]};
  `}
`;

export default InlineButtonsLayout;
