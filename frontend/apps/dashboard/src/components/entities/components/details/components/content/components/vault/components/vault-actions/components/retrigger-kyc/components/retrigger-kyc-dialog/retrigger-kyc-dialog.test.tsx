import {
  createUseRouterSpy,
  customRender,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';

import type { RetriggerKYCDialogProps } from './retrigger-kyc-dialog';
import RetriggerKYCDialog from './retrigger-kyc-dialog';

const defaultOptions = {
  open: true,
  onClose: jest.fn(),
};

const useRouterSpy = createUseRouterSpy();

const renderDialog = ({
  open = defaultOptions.open,
  onClose = defaultOptions.onClose,
}: Partial<RetriggerKYCDialogProps>) =>
  customRender(<RetriggerKYCDialog open={open} onClose={onClose} />);

describe.skip('<RetriggerKYCDialog />', () => {
  const entityId = 'fp_id_yCZehsWNeywHnk5JqL20u';

  beforeEach(() => {
    useRouterSpy({
      pathname: `/entities/${entityId}/trigger`,
      query: {
        id: entityId,
      },
    });
  });

  it('should call close callback', async () => {
    const onCloseMockFn = jest.fn();
    renderDialog({ onClose: onCloseMockFn });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await userEvent.click(cancelButton);

    expect(onCloseMockFn).toHaveBeenCalled();
  });

  it('shows error when attempt to submit without selecting option', async () => {
    renderDialog({ onClose: jest.fn() });

    const sendRequestButton = screen.getByRole('button', {
      name: 'Send request',
    });
    await userEvent.click(sendRequestButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          'You need to select an option before requesting more information from a user.',
        ),
      ).toBeInTheDocument();
    });
  });
});
