import React from 'react';
import { customRender, screen } from 'test-utils';

import Header, { HeaderProps } from './header';

describe('<Header />', () => {
  const renderTitle = ({
    title = 'title',
    subtitle = 'subtitle',
  }: Partial<HeaderProps>) =>
    customRender(<Header title={title} subtitle={subtitle} />);

  it('should render the title', () => {
    renderTitle({ title: 'Verify your phone number' });
    expect(screen.getByText('Verify your phone number')).toBeInTheDocument();
  });

  it('should render the subtitle', () => {
    renderTitle({ subtitle: 'Enter your phone number to proceed.' });
    expect(
      screen.getByText('Enter your phone number to proceed.'),
    ).toBeInTheDocument();
  });
});
