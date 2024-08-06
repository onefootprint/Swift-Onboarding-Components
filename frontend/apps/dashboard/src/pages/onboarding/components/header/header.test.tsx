import { customRender, screen, userEvent } from '@onefootprint/test-utils';

import Header from './header';

describe('<Header />', () => {
  it('should render the email of the logged user', () => {
    customRender(<Header userEmail="jane.doe@acme.com" onLogout={() => undefined} />);
    expect(screen.getByText('jane.doe@acme.com')).toBeInTheDocument();
  });

  it('should call the onLogout callback when clicking on the logout button', async () => {
    const onLogout = jest.fn();
    customRender(<Header userEmail="jane.doe@acme.com" onLogout={onLogout} />);
    const logout = screen.getByRole('button', { name: 'Log out' });
    await userEvent.click(logout);
    expect(onLogout).toHaveBeenCalled();
  });
});
