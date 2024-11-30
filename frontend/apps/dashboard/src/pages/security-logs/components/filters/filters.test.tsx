import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import Filters from './filters';

describe('<Filters />', () => {
  it('should open the drawer when the button is clicked', async () => {
    const user = userEvent.setup();
    customRender(<Filters />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const button = screen.getByRole('button', { name: 'Filters' });
    await user.click(button);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should close the drawer when the close button is clicked', async () => {
    const user = userEvent.setup();
    customRender(<Filters />);

    const button = screen.getByRole('button', { name: 'Filters' });
    await user.click(button);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
