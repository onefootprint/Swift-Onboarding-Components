import React from 'react';
import styled from 'styled-components';

import Text from '../text';

export type BreadcrumbItemProps = {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  as?: any;
  href?: string;
  children: string;
};

const BreadcrumbItem = ({ as, href, children }: BreadcrumbItemProps) => {
  const hasLink = !!href;
  return hasLink ? (
    <li>
      <Anchor href={href} as={as}>
        <Text color="tertiary" variant="body-3">
          {children}
        </Text>
      </Anchor>
    </li>
  ) : (
    <li>
      <Text variant="label-3">{children}</Text>
    </li>
  );
};

const Anchor = styled.a``;

export default BreadcrumbItem;
