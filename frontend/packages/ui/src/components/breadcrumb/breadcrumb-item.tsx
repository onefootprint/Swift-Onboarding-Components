import styled from '@onefootprint/styled';
import React from 'react';

import Typography from '../typography';

export type BreadcrumbItemProps = {
  as?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  href?: string;
  children: string;
};

const BreadcrumbItem = ({ as, href, children }: BreadcrumbItemProps) => {
  const hasLink = !!href;
  return hasLink ? (
    <li>
      <Anchor href={href} as={as}>
        <Typography color="tertiary" variant="body-3">
          {children}
        </Typography>
      </Anchor>
    </li>
  ) : (
    <li>
      <Typography variant="label-3">{children}</Typography>
    </li>
  );
};

const Anchor = styled.a``;

export default BreadcrumbItem;
