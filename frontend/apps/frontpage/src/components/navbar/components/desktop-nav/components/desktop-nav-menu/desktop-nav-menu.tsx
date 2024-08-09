import { IcoChevronDown16 } from '@onefootprint/icons';
import { createFontStyles } from '@onefootprint/ui';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import styled, { css, keyframes } from 'styled-components';

import type { NavMenu } from '../../../../types';
import DesktopNavMenuItem from '../desktop-nav-menu-item';

type DesktopNavbarMenuProps = {
  menu: NavMenu;
};

const { Item: NavigationMenuItem, Trigger: NavigationMenuTrigger, Content: NavigationMenuContent } = NavigationMenu;

const DesktopNavMenu = ({ menu }: DesktopNavbarMenuProps) => {
  const items = menu.items.map(item => <DesktopNavMenuItem item={item} key={item.text} />);

  return (
    <ItemContainer>
      <StyledTrigger>
        <Title>{menu.text}</Title>
        <IcoChevronDown16 className="chevron-icon" />
      </StyledTrigger>
      <Content>{items}</Content>
    </ItemContainer>
  );
};

const ItemContainer = styled(NavigationMenuItem)`
  position: relative;
  display: flex;
`;

const Title = styled.p`
  ${({ theme }) => css`
    ${createFontStyles('label-3')}
    color: ${theme.color.primary};
    text-decoration: none;
    display: flex;
  `}
`;

const StyledTrigger = styled(NavigationMenuTrigger)`
  ${({ theme }) => css`
    position: relative;
    all: unset;
    display: flex;
    cursor: pointer;
    align-items: center;
    gap: ${theme.spacing[2]};
    padding: ${theme.spacing[3]} ${theme.spacing[3]} ${theme.spacing[3]}
      ${theme.spacing[4]};

    .chevron-icon {
      transition: transform 0.08s ease-out;
    }

    &[data-state='open'] {
      opacity: 0.7;

      .chevron-icon {
        transform: rotate(180deg);
        opacity: 0.7;
      }
    }
  `}
`;

const Content = styled(NavigationMenuContent)`
  ${({ theme }) => css`
    position: absolute;
    left: 0;
    top: 80%;
    min-width: 380px;
    margin-top: ${theme.spacing[3]};
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
    box-shadow: ${theme.elevation[2]};
    background-color: ${theme.backgroundColor.primary};
    padding: ${theme.spacing[3]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    z-index: 1;

    &[data-state='open'] {
      animation-name: ${slideIn};
      animation-duration: 0.08s;
      animation-timing-function: ease-out;
    }

    &[data-state='closed'] {
      animation-name: ${slideOut};
      animation-duration: 0.08s;
      animation-timing-function: ease-in;
    }
  `}
`;

const slideIn = keyframes`
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-10px);
    opacity: 0;
  }
`;

export default DesktopNavMenu;
