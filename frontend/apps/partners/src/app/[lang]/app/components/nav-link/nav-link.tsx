import type { Icon } from '@onefootprint/icons';
import { Stack, createFontStyles } from '@onefootprint/ui';
import Link from 'next/link';
import type { Ref } from 'react';
import { forwardRef } from 'react';
import styled, { css } from 'styled-components';

const BADGE_MAX_COUNT = 99;

type NavLinkProps = {
  badgeCount?: number;
  href: string;
  icon: Icon;
  selected: boolean;
  text: string;
};

const NavLink = forwardRef(
  ({ badgeCount, href, icon: Icon, selected, text }: NavLinkProps, ref: Ref<HTMLAnchorElement>) => (
    <Container href={href} selected={selected} ref={ref}>
      <Stack direction="row" gap={3} align="center" justify="flex-start">
        <Icon color={selected ? 'primary' : 'tertiary'} />
        <Label selected={selected}>{text}</Label>
      </Stack>
      {badgeCount ? (
        <Badge data-selected={selected} className="badge">
          {badgeCount > BADGE_MAX_COUNT ? `${`${BADGE_MAX_COUNT}+`}` : badgeCount}
        </Badge>
      ) : null}
    </Container>
  ),
);

const Container = styled(Link)<{ selected: boolean }>`
  ${({ selected, theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.spacing[3]};
    text-decoration: none;
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    border-radius: ${theme.borderRadius.default};
    background-color: ${selected ? theme.backgroundColor.secondary : theme.backgroundColor.primary};

    &:hover {
      background-color: ${theme.backgroundColor.secondary};

      ${
        !selected &&
        css`
        .badge {
          color: ${theme.color.secondary};
          background-color: ${theme.backgroundColor.senary};
        }
      `
      }
    }

    .badge {
      color: ${theme.color.tertiary};
      background-color: ${theme.backgroundColor.secondary};
    }
  `};
`;

const Label = styled.span<{ selected: boolean }>`
  ${({ selected, theme }) => css`
    ${createFontStyles(selected ? 'label-3' : 'body-3')}
    color: ${selected ? theme.color.primary : theme.color.tertiary};
  `}
`;

const Badge = styled.span`
  ${({ theme }) => css`
    ${createFontStyles('caption-1')}
    background-color: ${theme.backgroundColor.secondary};
    border-radius: calc(${theme.borderRadius.default} - ${theme.spacing[1]});
    color: ${theme.color.quaternary};
    min-width: ${theme.spacing[6]};
    padding: ${theme.spacing[1]} ${theme.spacing[2]};
    text-align: center;

    &[data-selected='true'] {
      color: ${theme.color.quinary};
      background-color: ${theme.backgroundColor.accent};
    }
  `}
`;

export default NavLink;
