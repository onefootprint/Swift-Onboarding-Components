import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import mockRouter from 'next-router-mock';
import { asAdminUser } from 'src/config/tests';

import type { EditDialogProps } from './edit-dialog';
import EditDialog from './edit-dialog';
import { withListDetails, withListUpdate, withListUpdateError } from './edit-dialog.test.config';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

describe('<EditDialog />', () => {
  const listId = 'list_1';

  const renderEditDialog = ({ onClose = jest.fn(), onEdit = jest.fn() }: Partial<EditDialogProps>) =>
    customRender(<EditDialog open onClose={onClose} onEdit={onEdit} />);

  beforeEach(() => {
    mockRouter.setCurrentUrl(`/lists/${listId}`);
    mockRouter.query = {
      id: listId,
    };
    asAdminUser();
    withListDetails(listId);
  });

  it('should call onClose', async () => {
    const onClose = jest.fn();
    renderEditDialog({ onClose });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await userEvent.click(cancelButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('When updating errors', () => {
    beforeEach(() => {
      withListUpdateError(listId);
    });

    it('should show an error toast', async () => {
      const onEdit = jest.fn();
      renderEditDialog({ onEdit });

      const listName = screen.getByPlaceholderText('e.g. Blocked users') as HTMLInputElement;
      await userEvent.click(listName);
      await userEvent.clear(listName);
      await userEvent.type(listName, 'test name');

      const submitButton = screen.getByRole('button', { name: 'Save' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(onEdit).not.toHaveBeenCalled();
      });
    });
  });

  describe('When updating successfully', () => {
    beforeEach(() => {
      withListUpdate(listId);
    });

    it('should show a success toast for valid data', async () => {
      const onEdit = jest.fn();
      renderEditDialog({ onEdit });

      const listName = screen.getByPlaceholderText('e.g. Blocked users') as HTMLInputElement;
      await userEvent.click(listName);
      await userEvent.clear(listName);
      await userEvent.type(listName, 'test name');

      const submitButton = screen.getByRole('button', { name: 'Save' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Success')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(onEdit).toHaveBeenCalled();
      });
    });
  });
});
