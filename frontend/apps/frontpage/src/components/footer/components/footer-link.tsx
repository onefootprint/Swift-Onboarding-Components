import styled from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';

type FooterLinkProps = {
  text: string;
  href: string;
  newWindow?: boolean;
};

const FooterLink = ({ text, href, newWindow }: FooterLinkProps) => (
  <StyledLink
    href={href}
    rel="noopener noreferrer"
    target={newWindow ? '_blank' : undefined}
  >
    <Typography color="tertiary" variant="body-3">
      {text}
    </Typography>
  </StyledLink>
);

const StyledLink = styled(Link)`
  text-decoration: none;
`;

export default FooterLink;
