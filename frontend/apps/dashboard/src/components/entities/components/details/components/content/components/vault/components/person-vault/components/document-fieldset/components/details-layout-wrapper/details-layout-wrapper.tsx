import { Box, Stack } from '@onefootprint/ui';
import { useState } from 'react';
import styled, { css } from 'styled-components';
import InnerDrawer from './components/inner-drawer';

type DetailsLayoutWrapperProps = {
  children: React.ReactNode;
  drawerChildren?: React.ReactNode;
};

const DetailsLayoutWrapper = ({ children, drawerChildren }: DetailsLayoutWrapperProps) => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const hasDrawer = Boolean(drawerChildren);

  const handleDrawerToggle = () => {
    setDrawerOpen(currentOpen => !currentOpen);
  };

  return (
    <Container open={drawerOpen} data-has-drawer={hasDrawer}>
      {drawerChildren && (
        <InnerDrawer open={drawerOpen} onClose={handleDrawerToggle} onOpenChange={setDrawerOpen}>
          <Stack direction="column" gap={8} padding={7}>
            {drawerChildren}
          </Stack>
        </InnerDrawer>
      )}
      <Stack width="100%" height="100%" backgroundColor="secondary" padding={7} overflowY="auto">
        {children}
      </Stack>
    </Container>
  );
};

const Container = styled(Box)<{ open: boolean }>`
${({ open, theme }) => css` 
    background-color: ${theme.backgroundColor.secondary};
    height: 100%;
    overflow: hidden;

    &[data-has-drawer="true"] {
      display: grid;
      grid-template-areas: "drawer content";
      grid-template-columns: ${open ? '480px 1fr' : '1px 1fr'};
      transition: grid-template-columns 0.2s ease-in-out;
    }
`}
`;

export default DetailsLayoutWrapper;
