import * as RadixNavigationMenu from '@radix-ui/react-navigation-menu';
import styled, { css } from 'styled-components';

const StyledTrigger = styled(RadixNavigationMenu.Trigger)`
  background: none;
  border: 0;
`;

const StyledContent = styled(RadixNavigationMenu.Content)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    background: ${theme.backgroundColor.primary};
    border: 1px solid ${theme.borderColor.tertiary};
    box-shadow: 0px 1px 8px rgba(0, 0, 0, 0.14);
    border-radius: ${theme.borderRadius.default}px;
    padding: ${theme.spacing[5]}px;
  `}
`;

const StyledRoot = styled(RadixNavigationMenu.Root)`
  position: relative;
  display: flex;
`;

const NavigationMenu = {
  Root: StyledRoot,
  Trigger: StyledTrigger,
  List: RadixNavigationMenu.List,
  Item: RadixNavigationMenu.Item,
  Content: StyledContent,
  Sub: RadixNavigationMenu.Sub,
  Viewport: RadixNavigationMenu.Viewport,
  Link: RadixNavigationMenu.Link,
};

export default NavigationMenu;
