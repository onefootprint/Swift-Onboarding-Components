import React from 'react';
import { customRender, screen } from 'test-utils';

import Typography from './typography';

describe('<Typography />', () => {
  it('should render the content', () => {
    customRender(
      <Typography variant="display-1" color="primary">
        foo
      </Typography>,
    );

    expect(screen.getByText('foo')).toBeTruthy();
  });

  it('should assign a testID', () => {
    customRender(
      <Typography
        variant="display-1"
        color="primary"
        testID="typography-test-id"
      >
        foo
      </Typography>,
    );

    expect(screen.getByTestId('typography-test-id')).toBeTruthy();
  });
});
