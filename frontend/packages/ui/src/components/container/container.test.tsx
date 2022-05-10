import React from 'react';
import { customRender, screen } from 'test-utils';

import Container, { ContainerProps } from './container';

describe('<Container />', () => {
  const renderContainer = ({
    as = 'div',
    children = 'Foo',
    testID,
  }: Partial<ContainerProps>) =>
    customRender(
      <Container as={as} testID={testID}>
        {children}
      </Container>,
    );

  it('should assign a testID', () => {
    renderContainer({ testID: 'container-test-id' });
    expect(screen.getByTestId('container-test-id')).toBeInTheDocument();
  });

  it('should render the content', () => {
    renderContainer({ children: 'Lorem' });
    expect(screen.getByText('Lorem')).toBeInTheDocument();
  });

  describe('when it has a custom tag', () => {
    it('should render with the correct tag', () => {
      renderContainer({ children: 'Lorem', as: 'section' });
      const el = screen.getByText('Lorem');
      expect(el.tagName).toEqual('SECTION');
    });
  });
});
