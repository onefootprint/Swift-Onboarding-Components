import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';

import Dialog, { DialogProps } from './dialog';

describe('<Dialog />', () => {
  const renderDialog = ({
    closeIconComponent,
    closeAriaLabel = 'Close',
    title = 'Title',
    onClose = jest.fn(),
    primaryButton = {
      label: 'Primary',
    },
    secondaryButton,
    linkButton,
    size,
    testID,
    open,
    children = 'content',
  }: Partial<DialogProps>) =>
    customRender(
      // we need to ignore ts-lint given the constraints we have
      // as this is a test file, it's okay
      // @ts-ignore
      <Dialog
        closeAriaLabel={closeAriaLabel}
        closeIconComponent={closeIconComponent}
        linkButton={linkButton}
        onClose={onClose}
        open={open}
        primaryButton={primaryButton}
        secondaryButton={secondaryButton}
        size={size}
        testID={testID}
        title={title}
      >
        {children}
      </Dialog>,
    );

  describe('when the prop open is true', () => {
    it('should show the dialog', async () => {
      renderDialog({ open: true });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('when the dialog is open', () => {
    it('should assign a test id', () => {
      renderDialog({ open: true, testID: 'dialog-test-id' });
      expect(screen.getByTestId('dialog-test-id')).toBeInTheDocument();
    });

    it('should show the header text', () => {
      renderDialog({ open: true, title: 'header' });
      expect(screen.getByText('header')).toBeInTheDocument();
    });

    it('should trigger onClose when clicking on the close button', async () => {
      const onCloseMockFn = jest.fn();
      renderDialog({
        open: true,
        closeAriaLabel: 'Close',
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
      it('should render the right width when is compact', () => {
        renderDialog({ open: true, size: 'compact' });
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveStyle({
          width: '500px',
        });
      });

      it('should render the right width when is default', () => {
        renderDialog({ open: true, size: 'default' });
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveStyle({
          width: '650px',
        });
      });

      it('should render the right width when is large', () => {
        renderDialog({ open: true, size: 'large' });
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveStyle({
          width: '800px',
        });
      });
    });
  });
});
