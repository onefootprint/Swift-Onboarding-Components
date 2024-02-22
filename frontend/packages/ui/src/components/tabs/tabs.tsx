import React, { useId, useMemo } from 'react';
import styled, { css } from 'styled-components';

import TabContext from './components/context';

export type TabsProps = {
  children: React.ReactNode;
};

const Tabs = ({ children }: TabsProps) => {
  const layoutId = useId();
  const contextValues = useMemo(() => ({ layoutId }), [layoutId]);

  return (
    <TabContext.Provider value={contextValues}>
      <Container aria-orientation="horizontal" role="tablist">
        {children}
      </Container>
    </TabContext.Provider>
  );
};

const Container = styled.nav`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[5]};
    border-bottom: 1px solid ${theme.borderColor.tertiary};

    a,
    button {
      background: unset;
      border: unset;
      cursor: pointer;
      text-decoration: none;
      border-bottom: ${theme.borderWidth[2]} solid transparent;
      color: ${theme.color.tertiary};
      margin: 0;
      padding: 0 0 ${theme.spacing[3]} 0;
    }
  `}
`;

export default Tabs;
