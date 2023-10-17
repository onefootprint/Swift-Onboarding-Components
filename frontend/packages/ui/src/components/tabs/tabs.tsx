import styled, { css } from '@onefootprint/styled';
import React, { useId, useMemo } from 'react';

import { createFontStyles } from '../../utils/mixins';
import TabContext from './components/context';

export type TabsProps = {
  variant: 'pill' | 'underlined';
  children: React.ReactNode;
};

const Tabs = ({ variant = 'underlined', children }: TabsProps) => {
  const layoutId = useId();
  const contextValues = useMemo(
    () => ({ layoutId, variant }),
    [layoutId, variant],
  );

  return (
    <TabContext.Provider value={contextValues}>
      <Container
        aria-orientation="horizontal"
        data-variant={variant}
        role="tablist"
      >
        {children}
      </Container>
    </TabContext.Provider>
  );
};

const Container = styled.nav`
  ${({ theme }) => css`
    display: flex;

    a,
    button {
      background: unset;
      border: unset;
      cursor: pointer;
      text-decoration: none;
    }

    &[data-variant='pill'] {
      gap: ${theme.spacing[3]};
    }

    &[data-variant='underlined'] {
      gap: ${theme.spacing[7]};
      border-bottom: 1px solid ${theme.borderColor.tertiary};

      a,
      button {
        ${createFontStyles('body-3')};
        border-bottom: ${theme.borderWidth[2]} solid transparent;
        color: ${theme.color.tertiary};
        margin: 0;
        padding: 0 0 ${theme.spacing[3]} 0;
      }
    }
  `}
`;

export default Tabs;
