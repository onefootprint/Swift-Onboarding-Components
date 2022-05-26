import React from 'react';
import { Container } from 'ui';

type PrivateLayoutProps = {
  children: React.ReactNode;
};

const PrivateLayout = ({ children }: PrivateLayoutProps) => (
  <div data-testid="private-layout">
    <Container>
      <header>
        <h2>Footprint</h2>
        <nav>
          <ul>
            <li>Users</li>
            <li>Security logs</li>
            <li>Developers</li>
          </ul>
        </nav>
      </header>
    </Container>
    <section>{children}</section>
  </div>
);

export default PrivateLayout;
