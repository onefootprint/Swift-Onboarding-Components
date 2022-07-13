import React from 'react';
import { customRender, screen } from 'test-utils';

import Typography from './typography';

describe('<Typography />', () => {
  it('should render the content', () => {
    customRender(
      <Typography variant="caption-2" color="primary">
        foo
      </Typography>,
    );
    expect(screen.getByText('foo')).toBeInTheDocument();
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
    expect(screen.getByTestId('typography-test-id')).toBeInTheDocument();
  });

  it('should assign an ID', () => {
    customRender(
      <Typography variant="display-1" color="primary" id="typography-id">
        foo
      </Typography>,
    );
    expect(screen.getByText('foo').id).toEqual('typography-id');
  });
});
