import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import ErrorComponent from './error';

describe('<Error />', () => {
  it('should display the error message', () => {
    const error = {
      message: 'Something went wrong',
    };
    customRender(<ErrorComponent error={error} />);

    const errorMessage = screen.getByText('Something went wrong');
    expect(errorMessage).toBeInTheDocument();
  });
});
