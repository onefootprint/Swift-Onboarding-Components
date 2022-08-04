import React from 'react';
import { customRender, screen, userEvent, waitFor } from 'test-utils';

import CreateApiKeyDialog from './create-api-key-dialog';

describe('<CreateApiKeyDialog />', () => {
  const renderCreateApiKeyDialog = () => {
    customRender(<CreateApiKeyDialog open onClose={jest.fn()} />);
  };

  describe('when submitting an invalid form', () => {
    it('should display an error message', async () => {
      renderCreateApiKeyDialog();

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
