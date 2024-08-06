import {
  createClipboardSpy,
  createUseRouterSpy,
  customRender,
  mockRequest,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import { ContactInfoKind } from '@onefootprint/types';

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
}: Partial<UpdateAuthDialogProps>) => customRender(<UpdateAuthDialog open={open} onClose={onClose} />);

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

  it('should copy link to clipboard and close', async () => {
    const { writeTestMockFn } = createClipboardSpy();
    const onCloseMockFn = jest.fn();
    renderDialog({ onClose: onCloseMockFn });

    await waitFor(() => {
      expect(screen.getByDisplayValue('http://footprint.link/#tok_xxx')).toBeInTheDocument();
    });

    const copyButton = screen.getByRole('button', { name: 'Copy link' });
    await userEvent.click(copyButton);
    await waitFor(() => {
      expect(writeTestMockFn).toHaveBeenCalledWith('http://footprint.link/#tok_xxx');
    });
    expect(onCloseMockFn).toHaveBeenCalled();
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

  it('closes after sending link via SMS', async () => {
    const onCloseMockFn = jest.fn();
    renderDialog({ onClose: onCloseMockFn });

    await waitFor(() => {
      expect(screen.getByDisplayValue('http://footprint.link/#tok_xxx')).toBeInTheDocument();
    });

    mockRequest({
      method: 'post',
      path: `/entities/${entityFixture.id}/token`,
      statusCode: 200,
      response: {
        deliveryMethod: ContactInfoKind.email,
      },
    });

    const sendLinkButton = screen.getByRole('button', {
      name: 'Send via email',
    });
    await userEvent.click(sendLinkButton);

    await waitFor(() => {
      expect(screen.getByText('User will receive an email detailing the next steps shortly')).toBeInTheDocument();
    });
    expect(onCloseMockFn).toHaveBeenCalled();
  });
});
