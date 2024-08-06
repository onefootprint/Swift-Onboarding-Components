import { customRender, screen, selectEvents, userEvent, waitFor } from '@onefootprint/test-utils';
import { asAdminUser } from 'src/config/tests';

import type { CreateDialogProps } from './create-dialog';
import CreateDialog from './create-dialog';
import { withCreateList, withLists } from './create-dialog.test.config';

describe('<CreateDialog />', () => {
  const renderCreateDialog = ({ onClose = jest.fn() }: Partial<CreateDialogProps>) => {
    customRender(<CreateDialog open onClose={onClose} />);
  };

  beforeEach(() => {
    asAdminUser();
    withLists();
    withCreateList();
  });

  describe('submitting or closing the form', () => {
    it('should call onclose when closing', async () => {
      const onClose = jest.fn();
      renderCreateDialog({ onClose });

      const closeButton = screen.getByRole('button', { name: 'Close' });
      await userEvent.click(closeButton);

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('should display an error message', async () => {
      renderCreateDialog({});

      const submitButton = screen.getByRole('button', { name: 'Create' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText('Please enter a name for the list.');
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it('should error if we fail to submit a kind', async () => {
      renderCreateDialog({});

      const listName = screen.getByPlaceholderText('e.g. Blocked users');
      await userEvent.click(listName);
      await userEvent.type(listName, 'test name');

      const submitButton = screen.getByRole('button', { name: 'Create' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText('Please select a type.');
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it('should succeed when we submit a valid form', async () => {
      renderCreateDialog({});

      const listName = screen.getByPlaceholderText('e.g. Blocked users');
      await userEvent.click(listName);
      await userEvent.type(listName, 'test name');

      const kindSelect = screen.getByRole('button', { name: 'Select' });
      await selectEvents.select(kindSelect, 'Email address');

      const entriesTextArea = screen.getByLabelText('Enter values manually');
      await userEvent.click(entriesTextArea);
      await userEvent.type(entriesTextArea, 'piip@onefootprint.com');

      const submitButton = screen.getByRole('button', { name: 'Create' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('List created successfully.')).toBeInTheDocument();
      });
    });
  });

  describe('when entering invalid entries', () => {
    it('when kind is email addresses', async () => {
      renderCreateDialog({});

      const listName = screen.getByPlaceholderText('e.g. Blocked users');
      await userEvent.click(listName);
      await userEvent.type(listName, 'test name');

      const kindSelect = screen.getByRole('button', { name: 'Select' });
      await selectEvents.select(kindSelect, 'Email address');

      const entriesTextArea = screen.getByLabelText('Enter values manually') as HTMLInputElement;
      await userEvent.click(entriesTextArea);
      await userEvent.type(entriesTextArea, 'invalid email');
      expect(entriesTextArea.value).toBe('invalid email');

      const submitButton = screen.getByRole('button', { name: 'Create' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
      });

      await userEvent.click(entriesTextArea);
      await userEvent.clear(entriesTextArea);
      await userEvent.type(entriesTextArea, 'piip@onefootprint.com');

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('Please enter a valid email address.')).toBeNull();
      });
    });

    it('when kind is email domain', async () => {
      renderCreateDialog({});

      const listName = screen.getByPlaceholderText('e.g. Blocked users');
      await userEvent.click(listName);
      await userEvent.type(listName, 'test name');

      const kindSelect = screen.getByRole('button', { name: 'Select' });
      await selectEvents.select(kindSelect, 'Email domain');

      const entriesTextArea = screen.getByLabelText('Enter values manually');
      await userEvent.click(entriesTextArea);
      await userEvent.type(entriesTextArea, 'invalid');

      const submitButton = screen.getByRole('button', { name: 'Create' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email domain.')).toBeInTheDocument();
      });

      await userEvent.click(entriesTextArea);
      await userEvent.clear(entriesTextArea);
      await userEvent.type(entriesTextArea, 'onefootprint.com');

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('Please enter a valid email domain.')).toBeNull();
      });
    });

    it('when kind is ssn9', async () => {
      renderCreateDialog({});

      const listName = screen.getByPlaceholderText('e.g. Blocked users');
      await userEvent.click(listName);
      await userEvent.type(listName, 'test name');

      const kindSelect = screen.getByRole('button', { name: 'Select' });
      await selectEvents.select(kindSelect, 'SSN');

      const entriesTextArea = screen.getByLabelText('Enter values manually');
      await userEvent.click(entriesTextArea);
      await userEvent.type(entriesTextArea, 'invalid');

      const submitButton = screen.getByRole('button', { name: 'Create' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid SSN.')).toBeInTheDocument();
      });

      await userEvent.click(entriesTextArea);
      await userEvent.clear(entriesTextArea);
      await userEvent.type(entriesTextArea, '123456789');

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('Please enter a valid SSN9.')).toBeNull();
      });
    });

    it('when kind is phone number', async () => {
      renderCreateDialog({});

      const listName = screen.getByPlaceholderText('e.g. Blocked users');
      await userEvent.click(listName);
      await userEvent.type(listName, 'test name');

      const kindSelect = screen.getByRole('button', { name: 'Select' });
      await selectEvents.select(kindSelect, 'Phone number');

      const entriesTextArea = screen.getByLabelText('Enter values manually');
      await userEvent.click(entriesTextArea);
      await userEvent.type(entriesTextArea, 'invalid');

      const submitButton = screen.getByRole('button', { name: 'Create' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid phone number.')).toBeInTheDocument();
      });

      await userEvent.click(entriesTextArea);
      await userEvent.clear(entriesTextArea);
      await userEvent.type(entriesTextArea, '+12122229999, +12122229999');

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('Please enter a valid phone number.')).toBeNull();
      });
    });

    it('when kind is phone country code', async () => {
      renderCreateDialog({});

      const listName = screen.getByPlaceholderText('e.g. Blocked users');
      await userEvent.click(listName);
      await userEvent.type(listName, 'test name');

      const kindSelect = screen.getByRole('button', { name: 'Select' });
      await selectEvents.select(kindSelect, 'Phone country code');

      const entriesTextArea = screen.getByLabelText('Enter values manually');
      await userEvent.click(entriesTextArea);
      await userEvent.type(entriesTextArea, 'invalid');

      const submitButton = screen.getByRole('button', { name: 'Create' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid phone country code.')).toBeInTheDocument();
      });

      await userEvent.click(entriesTextArea);
      await userEvent.clear(entriesTextArea);
      await userEvent.type(entriesTextArea, '1,2,3');

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('Please enter a valid phone country code.')).toBeNull();
      });
    });

    it('when kind is ip address', async () => {
      renderCreateDialog({});

      const listName = screen.getByPlaceholderText('e.g. Blocked users');
      await userEvent.click(listName);
      await userEvent.type(listName, 'test name');

      const kindSelect = screen.getByRole('button', { name: 'Select' });
      await selectEvents.select(kindSelect, 'IP address');

      const entriesTextArea = screen.getByLabelText('Enter values manually');
      await userEvent.click(entriesTextArea);
      await userEvent.type(entriesTextArea, 'invalid');

      const submitButton = screen.getByRole('button', { name: 'Create' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid IP address.')).toBeInTheDocument();
      });

      await userEvent.click(entriesTextArea);
      await userEvent.clear(entriesTextArea);
      await userEvent.type(entriesTextArea, '11.11.22.11');

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('Please enter a valid IP address.')).toBeNull();
      });
    });
  });
});
