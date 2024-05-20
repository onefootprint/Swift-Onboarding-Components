import '../../config/initializers/i18next-test';

import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import type { ContainerProps } from './container';
import Container from './container';

describe('<Container />', () => {
  const renderContainer = ({
    tag = 'div',
    children = 'Foo',
    testID,
  }: Partial<ContainerProps>) =>
    customRender(
      <Container tag={tag} testID={testID}>
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
      renderContainer({ children: 'Lorem', tag: 'section' });
      const el = screen.getByText('Lorem');
      expect(el.tagName).toEqual('SECTION');
    });
  });
});
