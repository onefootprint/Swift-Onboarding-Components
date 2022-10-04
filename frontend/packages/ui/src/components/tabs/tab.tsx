import React, { forwardRef } from 'react';
import styled from 'styled-components';

export type TabItemPros = {
  as?: React.ComponentType<any> | string;
  children: React.ReactNode;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  selected?: boolean;
};

const TabItem = forwardRef<HTMLAnchorElement, TabItemPros>(
  ({ as, children, href, onClick, selected = false }: TabItemPros, ref) => (
    <TabItemContainer
      aria-selected={selected}
      as={as}
      data-selected={selected}
      href={href}
      onClick={onClick}
      ref={ref}
      role="tab"
      tabIndex={0}
    >
      {children}
    </TabItemContainer>
  ),
);

const TabItemContainer = styled.a``;

export default TabItem;
