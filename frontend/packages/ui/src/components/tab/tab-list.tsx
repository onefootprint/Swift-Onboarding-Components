import React from 'react';
import styled, { css } from 'styled';

export type TabListProps = {
  children: React.ReactNode;
  testID?: string;
};

const TabList = ({ children, testID }: TabListProps) => (
  <Container role="tablist" aria-orientation="horizontal" data-testid={testID}>
    {children}
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[3]}px;
  `}
`;

export default TabList;
