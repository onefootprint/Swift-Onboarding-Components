import { customRender, screen } from '@onefootprint/test-utils';
import DateTime from './date-time';

describe('<DateTime />', () => {
  const timestamp = '2023-05-15T14:30:00Z';

  it('renders the date in the correct format', () => {
    customRender(<DateTime timestamp={timestamp} />);
    expect(screen.getByText('05/15/23')).toBeInTheDocument();
  });

  it('renders the time in the correct format', () => {
    customRender(<DateTime timestamp={timestamp} />);
    expect(screen.getByText('2:30 PM')).toBeInTheDocument();
  });
});
