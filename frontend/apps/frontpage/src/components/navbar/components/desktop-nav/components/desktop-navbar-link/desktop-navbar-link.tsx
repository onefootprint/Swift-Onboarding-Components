import Link from 'next/link';
import React from 'react';

import { NavBarLink } from '../../../../types';

type DesktopNavBarLinkProps = {
  link: NavBarLink;
};
const DesktopNavBarLink = ({ link }: DesktopNavBarLinkProps) => (
  <Link href={link.href}>
    <a href={link.href}>{link.text}</a>
  </Link>
);

export default DesktopNavBarLink;
