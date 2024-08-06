import { Stack, createFontStyles } from '@onefootprint/ui';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import Link from 'next/link';
import styled, { css } from 'styled-components';

import type { NavMenuItem } from '../../../../types';

type DesktopNavMenuItemProps = {
  item: NavMenuItem;
};

const { Link: NavigationMenuLink } = NavigationMenu;

const DesktopNavMenuItem = ({ item }: DesktopNavMenuItemProps) => {
  const Icon = item.iconComponent;
  return (
    <StyledLink asChild>
      <Link href={item.href}>
        <Stack flex={0} align="center" justify="center" height="fit-content">
          <Icon />
        </Stack>
        <ItemText>
          <Title>{item.text}</Title>
          <Subtitle>{item.subtext}</Subtitle>
        </ItemText>
      </Link>
    </StyledLink>
  );
};

const ItemText = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    margin-left: ${theme.spacing[4]};
    text-decoration: none;
  `}
`;

const Title = styled.p`
  ${({ theme }) => css`
    ${createFontStyles('label-3')}
    color: ${theme.color.primary};
    text-decoration: none;
    display: flex;
  `}
`;

const Subtitle = styled.p`
  ${({ theme }) => css`
    ${createFontStyles('body-3')}
    color: ${theme.color.tertiary};
    text-decoration: none;
    display: flex;
  `}
`;

const StyledLink = styled(NavigationMenuLink)`
  ${({ theme }) => css`
    text-decoration: none;
    display: flex;
    align-items: flex-start;
    flex-direction: row;
    padding: ${theme.spacing[4]};
    border-radius: ${theme.borderRadius.default};
    background-color: ${theme.backgroundColor.primary}
    text-decoration: none;
    transition: all 0.1s ease-in-out;

    &:hover {
      background-color: ${theme.backgroundColor.secondary};
    }
    :focus {
      background-color: ${theme.backgroundColor.secondary};
    }

    > svg {
      align-self: flex-start;
    }

    && {
      svg {
        path {
          fill: ${theme.color.primary};
        }
      }
    }
  `}
`;

export default DesktopNavMenuItem;
