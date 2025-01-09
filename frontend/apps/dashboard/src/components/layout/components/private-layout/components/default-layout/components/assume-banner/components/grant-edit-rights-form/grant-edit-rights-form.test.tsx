import { customRender, mockRequest, screen, userEvent } from '@onefootprint/test-utils';
import GrantEditRightsForm from './grant-edit-rights-form';

describe('<GrantEditRightsForm />', () => {
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderForm = () => {
    return customRender(<GrantEditRightsForm onClose={onClose} />);
  };

  it('submits the form successfully', async () => {
    mockRequest({
      path: '/private/access_requests',
      method: 'post',
      response: {},
    });

    renderForm();

    const durationInput = screen.getByPlaceholderText('1');
    await userEvent.type(durationInput, '2');

    // Select scopes - picking first two options
    const scopeSelect = screen.getByRole('combobox');
    await userEvent.click(scopeSelect);
    await userEvent.keyboard('{ArrowDown}'); // Navigate to first option
    await userEvent.keyboard('{Enter}'); // Select first option
    await userEvent.keyboard('{ArrowDown}'); // Navigate to second option
    await userEvent.keyboard('{Enter}'); // Select second option

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await userEvent.click(submitButton);

    // Wait for toast to appear
    await screen.findByText('Edit grant requested');
    await screen.findByText('A Risk Ops manager will review your request shortly.');
  });

  it('shows error toast when submission fails', async () => {
    mockRequest({
      path: '/private/access_requests',
      method: 'post',
      response: { message: 'Something went wrong' },
      statusCode: 500,
    });

    renderForm();

    // Select scopes - picking first two options
    const scopeSelect = screen.getByRole('combobox');
    await userEvent.click(scopeSelect);
    await userEvent.keyboard('{ArrowDown}'); // Navigate to first option
    await userEvent.keyboard('{Enter}'); // Select first option
    await userEvent.keyboard('{ArrowDown}'); // Navigate to second option
    await userEvent.keyboard('{Enter}'); // Select second option

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await userEvent.click(submitButton);

    // Wait for error toast
    await screen.findByText('Error requesting edit rights.');
    await screen.findByText('Something went wrong');
  });

  it('calls onClose when cancel is clicked', async () => {
    renderForm();

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await userEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
