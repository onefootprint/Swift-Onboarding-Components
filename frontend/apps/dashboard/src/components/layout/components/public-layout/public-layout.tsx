import React from 'react';

type PublicLayoutProps = {
  children: React.ReactNode;
};

const PublicLayout = ({ children }: PublicLayoutProps) => (
  <div data-testid="public-layout">{children}</div>
);

export default PublicLayout;
