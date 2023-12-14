import type { Color, FontVariant } from '@onefootprint/design-tokens';
import { IcoArrowUpRight16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Stack, Typography } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';

type NavigationLinkProps = {
  children: string;
  href: string;
  variant?: FontVariant;
  color?: Color;
};

const NavigationLink = ({
  children,
  href,
  variant = 'body-3',
  color = 'primary',
}: NavigationLinkProps) => (
  <Container href={href} target="_blank">
    <Typography variant={variant} color={color}>
      {children}
    </Typography>
    <Stack marginTop={1}>
      <IcoArrowUpRight16 color={color} />
    </Stack>
  </Container>
);

const Container = styled(Link)`
  ${({ theme }) => css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    gap: ${theme.spacing[1]};
    background-color: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.default};
    padding: ${theme.spacing[1]} ${theme.spacing[1]} ${theme.spacing[1]}
      ${theme.spacing[3]};
    transition: border 0.2s ease-in-out;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.transparent};

    &:hover {
      border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    }
  `}
`;

export default NavigationLink;
