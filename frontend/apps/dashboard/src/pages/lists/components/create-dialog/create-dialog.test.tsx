import {
  customRender,
  screen,
  selectEvents,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';

import type { CreateDialogProps } from './create-dialog';
import CreateDialog from './create-dialog';
import { withCreateList, withLists } from './create-dialog.test.config';

describe('<CreateDialog />', () => {
  const renderCreateDialog = ({
    onClose = jest.fn(),
    onCreate = jest.fn(),
  }: Partial<CreateDialogProps>) => {
    customRender(<CreateDialog open onClose={onClose} onCreate={onCreate} />);
  };

  describe('successful get lists call', () => {
    beforeEach(() => {
      withLists();
      withCreateList();
    });

    describe('when submitting an invalid form', () => {
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
          const errorMessage = screen.getByText(
            'Please enter a name for the list.',
          );
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
    });

    it('should succeed when we submit a valid form', async () => {
      const onCreate = jest.fn();
      renderCreateDialog({ onCreate });

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
        expect(
          screen.getByText('List created successfully.'),
        ).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(onCreate).toHaveBeenCalled();
      });
    });
  });
});
