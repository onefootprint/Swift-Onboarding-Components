import { Text } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import styled from 'styled-components';

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
    <Text color="tertiary" variant="body-3">
      {text}
    </Text>
  </StyledLink>
);

const StyledLink = styled(Link)`
  text-decoration: none;
`;

export default FooterLink;
