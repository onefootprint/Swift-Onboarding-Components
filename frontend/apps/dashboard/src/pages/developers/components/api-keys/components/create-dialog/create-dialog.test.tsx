import React from 'react';
import { customRender, screen, userEvent, waitFor } from 'test-utils';

import CreateDialog from './create-dialog';

describe('<CreateDialog />', () => {
  const renderCreateDialog = () => {
    customRender(<CreateDialog open onClose={jest.fn()} />);
  };

  describe('when submitting an invalid form', () => {
    it('should display an error message', async () => {
      renderCreateDialog();

      const submitButton = screen.getByRole('button', { name: 'Create' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(
          'Please enter a name for your secret key.',
        );
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });
});
