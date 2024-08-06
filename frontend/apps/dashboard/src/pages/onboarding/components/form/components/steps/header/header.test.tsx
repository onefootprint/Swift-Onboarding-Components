import { customRender, screen } from '@onefootprint/test-utils';

import type { HeaderProps } from './header';
import Header from './header';

describe('<Header />', () => {
  const renderTitle = ({ title = 'title', subtitle = 'subtitle' }: Partial<HeaderProps>) =>
    customRender(<Header title={title} subtitle={subtitle} />);

  it('should render the title', () => {
    renderTitle({ title: 'Tell us about you' });
    expect(screen.getByText('Tell us about you')).toBeInTheDocument();
  });

  it('should render the subtitle', () => {
    renderTitle({ subtitle: 'Please provide some basic personal information' });
    expect(screen.getByText('Please provide some basic personal information')).toBeInTheDocument();
  });
});
