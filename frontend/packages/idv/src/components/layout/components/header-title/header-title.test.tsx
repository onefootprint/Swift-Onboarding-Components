import '../../../../config/initializers/i18next-test';

import { customRender, screen } from '@onefootprint/test-utils';

import type { HeaderTitleProps } from './header-title';
import HeaderTitle from './header-title';

describe('<HeaderTitle />', () => {
  const renderTitle = ({ title = 'title', subtitle = 'subtitle' }: Partial<HeaderTitleProps>) =>
    customRender(<HeaderTitle title={title} subtitle={subtitle} />);

  it('should render the title', () => {
    renderTitle({ title: 'Verify your phone number' });
    expect(screen.getByText('Verify your phone number')).toBeInTheDocument();
  });

  it('should render the subtitle', () => {
    renderTitle({ subtitle: 'Enter your phone number to proceed.' });
    expect(screen.getByText('Enter your phone number to proceed.')).toBeInTheDocument();
  });
});
