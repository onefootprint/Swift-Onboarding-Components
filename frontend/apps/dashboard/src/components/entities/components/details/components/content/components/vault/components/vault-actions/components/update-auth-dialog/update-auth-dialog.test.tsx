import {
  createClipboardSpy,
  createUseRouterSpy,
  customRender,
  mockRequest,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';

import type { UpdateAuthDialogProps } from './update-auth-dialog';
import UpdateAuthDialog from './update-auth-dialog';
import { entityFixture, withEntity } from './update-auth-dialog.test.config';

const defaultOptions = {
  open: true,
  onClose: jest.fn(),
};

const useRouterSpy = createUseRouterSpy();

const renderDialog = ({
  open = defaultOptions.open,
  onClose = defaultOptions.onClose,
}: Partial<UpdateAuthDialogProps>) =>
  customRender(<UpdateAuthDialog open={open} onClose={onClose} />);

describe('<UpdateAuthDialog />', () => {
  beforeEach(() => {
    withEntity();
    useRouterSpy({
      pathname: `/entities/${entityFixture.id}`,
      query: {
        id: entityFixture.id,
      },
    });
    mockRequest({
      method: 'post',
      path: `/entities/${entityFixture.id}/token`,
      statusCode: 200,
      response: {
        link: 'http://footprint.link/#tok_xxx',
        token: 'tok_xxx',
        expiresAt: '',
      },
    });
  });

  it('should call close callback', async () => {
    const onCloseMockFn = jest.fn();
    renderDialog({ onClose: onCloseMockFn });

    const doneButton = screen.getByRole('button', { name: 'Done' });
    await userEvent.click(doneButton);

    expect(onCloseMockFn).toHaveBeenCalled();
  });

  it('can copy link to clipboard', async () => {
    const { writeTestMockFn } = createClipboardSpy();
    renderDialog({});

    await waitFor(() => {
      expect(
        screen.getByDisplayValue('http://footprint.link/#tok_xxx'),
      ).toBeInTheDocument();
    });

    const copyButton = screen.getByRole('button', { name: 'copy' });
    await userEvent.click(copyButton);
    await waitFor(() => {
      expect(writeTestMockFn).toHaveBeenCalledWith(
        'http://footprint.link/#tok_xxx',
      );
    });
  });

  it('closes on error creating token', async () => {
    const onCloseMockFn = jest.fn();
    mockRequest({
      method: 'post',
      path: `/entities/${entityFixture.id}/token`,
      statusCode: 400,
      response: {},
    });
    renderDialog({ onClose: onCloseMockFn });

    await waitFor(() => {
      expect(screen.getByText('Uh-oh!')).toBeInTheDocument();
    });
    expect(onCloseMockFn).toHaveBeenCalled();
  });
});
