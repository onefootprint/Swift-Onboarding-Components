import Link from 'next/link';
import React from 'react';

import { NavLink } from '../../../../types';

type DesktopNavLinkProps = {
  link: NavLink;
};
const DesktopNavLink = ({ link }: DesktopNavLinkProps) => (
  <Link href={link.href}>
    <a href={link.href}>{link.text}</a>
  </Link>
);

export default DesktopNavLink;
