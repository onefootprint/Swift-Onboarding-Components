import '../../config/initializers/i18next-test';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender } from '../../utils/test-utils';

import type { DialogProps } from './dialog';
import Dialog from './dialog';

describe('<Dialog />', () => {
  const renderDialog = ({
    headerIcon = {},
    title = 'Title',
    onClose = jest.fn(),
    primaryButton = {
      label: 'Primary',
    },
    secondaryButton,
    linkButton,
    size,
    testID,
    open = true,
    children = 'content',
    isConfirmation = false,
  }: Partial<DialogProps>) =>
    customRender(
      // we need to ignore ts-lint given the constraints we have
      // as this is a test file, it's okay
      // @ts-ignore
      <Dialog
        headerIcon={headerIcon}
        linkButton={linkButton}
        onClose={onClose}
        open={open}
        primaryButton={primaryButton}
        secondaryButton={secondaryButton}
        size={size}
        testID={testID}
        title={title}
        isConfirmation={isConfirmation}
      >
        {children}
      </Dialog>,
    );

  describe('when the prop open is true', () => {
    it('should show the dialog', async () => {
      renderDialog({ open: true });
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('when the dialog is open', () => {
    it('should assign a test id', async () => {
      renderDialog({ open: true, testID: 'dialog-test-id' });
      await waitFor(() => {
        expect(screen.getByTestId('dialog-test-id')).toBeInTheDocument();
      });
    });

    it('should show the header text', async () => {
      renderDialog({ open: true, title: 'header' });
      await waitFor(() => {
        expect(screen.getByText('header')).toBeInTheDocument();
      });
    });

    it('should trigger onClose when clicking on the close button', async () => {
      const onCloseMockFn = jest.fn();
      renderDialog({
        open: true,
        onClose: onCloseMockFn,
      });
      const closeButton = screen.getByRole('button', { name: 'Close' });
      await userEvent.click(closeButton);
      expect(onCloseMockFn).toHaveBeenCalled();
    });

    it('should trigger onClose when pressing Escape', async () => {
      const onCloseMockFn = jest.fn();
      renderDialog({
        open: true,
        onClose: onCloseMockFn,
      });
      await userEvent.keyboard('{Escape}');
      expect(onCloseMockFn).toHaveBeenCalled();
    });

    it('should show the content', () => {
      renderDialog({ open: true, children: 'content' });
      expect(screen.getByText('content')).toBeInTheDocument();
    });

    it('should render the primary button and append onClick', async () => {
      const primaryButton = {
        label: 'Primary',
        onClick: jest.fn(),
      };
      renderDialog({ open: true, primaryButton });
      const button = screen.getByRole('button', { name: 'Primary' });
      await userEvent.click(button);
      expect(primaryButton.onClick).toHaveBeenCalled();
    });

    it('should render the secondary button and append onClick', async () => {
      const secondaryButton = {
        label: 'Secondary',
        onClick: jest.fn(),
      };
      renderDialog({ open: true, secondaryButton });
      const button = screen.getByRole('button', { name: 'Secondary' });
      await userEvent.click(button);
      expect(secondaryButton.onClick).toHaveBeenCalled();
    });

    it('should render the link button and append onClick', async () => {
      const linkButton = {
        label: 'Link Button',
        onClick: jest.fn(),
      };
      renderDialog({ open: true, linkButton });
      const button = screen.getByRole('button', { name: 'Link Button' });
      await userEvent.click(button);
      expect(linkButton.onClick).toHaveBeenCalled();
    });

    describe('sizes', () => {
      it('should render the right width when is compact', async () => {
        renderDialog({ open: true, size: 'compact', isConfirmation: false });
        const dialog = screen.getByRole('dialog');
        await waitFor(() => {
          expect(dialog).toHaveStyle({
            width: '500px',
          });
        });
      });
    });

    it('should render the right width when is default', async () => {
      renderDialog({ open: true, size: 'default', isConfirmation: false });
      const dialog = screen.getByRole('dialog');
      await waitFor(() => {
        expect(dialog).toHaveStyle({
          width: '650px',
        });
      });
    });
  });
});
