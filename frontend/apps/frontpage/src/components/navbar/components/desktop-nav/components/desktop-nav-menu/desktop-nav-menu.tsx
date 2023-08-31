import { primitives } from '@onefootprint/design-tokens';
import { IcoChevronDown16 } from '@onefootprint/icons';
import styled, { css, keyframes } from '@onefootprint/styled';
import { createFontStyles } from '@onefootprint/ui';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import React from 'react';

import { NavMenu } from '../../../../types';
import DesktopNavMenuItem from '../desktop-nav-menu-item';

type DesktopNavbarMenuProps = {
  menu: NavMenu;
  isOnDarkSection?: boolean;
};

const DesktopNavMenu = ({ menu, isOnDarkSection }: DesktopNavbarMenuProps) => {
  const items = menu.items.map(item => (
    <DesktopNavMenuItem
      item={item}
      key={item.text}
      isOnDarkSection={isOnDarkSection}
    />
  ));

  return (
    <ItemContainer>
      <StyledTrigger>
        <Title isOnDarkSection={isOnDarkSection}>{menu.text}</Title>
        <IconContainer isOnDarkSection={isOnDarkSection}>
          <IcoChevronDown16 />
        </IconContainer>
      </StyledTrigger>
      <Content isOnDarkSection={isOnDarkSection}>{items}</Content>
    </ItemContainer>
  );
};

const ItemContainer = styled(NavigationMenu.Item)`
  position: relative;
  display: flex;
`;

const Title = styled.p<{ isOnDarkSection?: boolean }>`
  ${({ theme, isOnDarkSection }) => css`
    ${createFontStyles('label-3')}
    color: ${isOnDarkSection ? primitives.Gray0 : theme.color.primary};
    text-decoration: none;
    display: flex;
  `}
`;

const StyledTrigger = styled(NavigationMenu.Trigger)`
  ${({ theme }) => css`
    position: relative;
    all: unset;
    display: flex;
    cursor: pointer;
    padding: ${theme.spacing[3]} ${theme.spacing[3]} ${theme.spacing[3]}
      ${theme.spacing[4]};

    &[data-state='open'] {
      opacity: 0.7;

      svg {
        transform: rotate(180deg);
        opacity: 0.7;
      }
    }
  `}
`;

const IconContainer = styled.div<{ isOnDarkSection?: boolean }>`
  ${({ theme, isOnDarkSection }) => css`
    min-width: 16px;
    height: 20px;
    display: flex;
    align-items: center;

    svg {
      margin-left: ${theme.spacing[2]};
    }

    && {
      svg {
        path {
          fill: ${isOnDarkSection ? primitives.Gray0 : theme.color.primary};
        }
      }
    }
  `}
`;

const Content = styled(NavigationMenu.Content)<{ isOnDarkSection?: boolean }>`
  ${({ theme, isOnDarkSection }) => css`
    position: absolute;
    left: 0;
    top: 100%;
    min-width: 380px;
    margin-top: ${theme.spacing[3]};
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
    box-shadow: ${theme.elevation[2]};
    background-color: ${isOnDarkSection
      ? primitives.Gray800
      : theme.backgroundColor.primary};
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
