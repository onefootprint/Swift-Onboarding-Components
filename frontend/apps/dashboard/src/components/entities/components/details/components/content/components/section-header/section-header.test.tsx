import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import SectionHeader from './section-header';

describe('<SectionHeader />', () => {
  it('should render the title', () => {
    customRender(<SectionHeader title="Risk signals" />);
    expect(screen.getByText('Risk signals')).toBeInTheDocument();
  });
});
