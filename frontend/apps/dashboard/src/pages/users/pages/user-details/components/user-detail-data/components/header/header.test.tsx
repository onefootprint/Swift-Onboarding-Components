import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import Header from './header';

describe('<Header />', () => {
  it('should render the title', () => {
    customRender(<Header title="Risk signals" />);
    expect(screen.getByText('Risk signals')).toBeInTheDocument();
  });
});
