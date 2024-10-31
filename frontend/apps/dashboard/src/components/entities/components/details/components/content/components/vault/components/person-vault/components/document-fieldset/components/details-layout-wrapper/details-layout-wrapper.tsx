import { Box, Stack } from '@onefootprint/ui';
import { forwardRef, useState } from 'react';
import styled, { css } from 'styled-components';
import InnerDrawer from './components/inner-drawer';

type DetailsLayoutWrapperProps = {
  children: React.ReactNode;
  drawerChildren?: React.ReactNode;
};

const DetailsLayoutWrapper = forwardRef<HTMLDivElement, DetailsLayoutWrapperProps>(
  ({ children, drawerChildren }, ref) => {
    const [drawerOpen, setDrawerOpen] = useState(true);
    const hasDrawer = Boolean(drawerChildren);

    const handleDrawerToggle = () => {
      setDrawerOpen(currentOpen => !currentOpen);
    };

    return (
      <Container
        open={drawerOpen}
        data-has-drawer={hasDrawer}
        backgroundColor="secondary"
        height="100%"
        overflow="hidden"
      >
        {drawerChildren && (
          <InnerDrawer open={drawerOpen} onClose={handleDrawerToggle} onOpenChange={setDrawerOpen}>
            <Stack direction="column" gap={8} padding={7}>
              {drawerChildren}
            </Stack>
          </InnerDrawer>
        )}
        <Stack
          ref={ref}
          justify="center"
          width="100%"
          height="100%"
          backgroundColor="secondary"
          padding={7}
          overflowY="auto"
          position="relative"
        >
          {children}
        </Stack>
      </Container>
    );
  },
);

const Container = styled(Box)<{ open: boolean }>`
  ${({ open }) => css` 
      --drawer-width: 480px;
      &[data-has-drawer="true"] {
        display: grid;
        grid-template-areas: "drawer content";
        grid-template-columns: ${open ? 'var(--drawer-width) 1fr' : '1px 1fr'};
        transition: grid-template-columns 0.2s ease-in-out;
      }
  `}
`;

export default DetailsLayoutWrapper;
