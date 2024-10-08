import '../../config/initializers/i18next-test';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender } from '../../utils/test-utils';

import type { DrawerProps } from './drawer';
import Drawer from './drawer';

describe('<Drawer />', () => {
  const renderDrawer = ({
    closeIconComponent,
    closeAriaLabel = 'Close',
    title = 'Title',
    onClose = jest.fn(),
    open,
    children = 'content',
    primaryButton,
    secondaryButton,
    linkButton,
  }: Partial<DrawerProps>) =>
    customRender(
      <Drawer
        closeAriaLabel={closeAriaLabel}
        closeIconComponent={closeIconComponent}
        onClose={onClose}
        open={open}
        title={title}
        primaryButton={primaryButton}
        secondaryButton={secondaryButton}
        linkButton={linkButton}
      >
        {children}
      </Drawer>,
    );

  describe('when the prop open is true', () => {
    it('should render the drawer', () => {
      renderDrawer({ open: true });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('when the drawer is open', () => {
    it('should show the header text', () => {
      renderDrawer({ open: true, title: 'header' });
      expect(screen.getByText('header')).toBeInTheDocument();
    });

    it('should trigger onClose when clicking on the close button', async () => {
      const onCloseMockFn = jest.fn();
      renderDrawer({
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
      renderDrawer({
        open: true,
        onClose: onCloseMockFn,
      });
      await userEvent.keyboard('{Escape}');
      expect(onCloseMockFn).toHaveBeenCalled();
    });

    it('should show the content', () => {
      renderDrawer({ open: true, children: 'content' });
      expect(screen.getByText('content')).toBeInTheDocument();
    });

    it('should render the primary button and trigger onClick', async () => {
      const onPrimaryClickMockFn = jest.fn();
      renderDrawer({
        open: true,
        primaryButton: { label: 'Primary', onClick: onPrimaryClickMockFn },
      });
      const primaryButton = screen.getByRole('button', { name: 'Primary' });
      await userEvent.click(primaryButton);
      expect(onPrimaryClickMockFn).toHaveBeenCalled();
    });

    it('should render the secondary button and trigger onClick', async () => {
      const onSecondaryClickMockFn = jest.fn();
      renderDrawer({
        open: true,
        secondaryButton: { label: 'Secondary', onClick: onSecondaryClickMockFn },
      });
      const secondaryButton = screen.getByRole('button', { name: 'Secondary' });
      await userEvent.click(secondaryButton);
      expect(onSecondaryClickMockFn).toHaveBeenCalled();
    });

    it('should render the link button and trigger onClick', async () => {
      const onLinkClickMockFn = jest.fn();
      renderDrawer({
        open: true,
        linkButton: { label: 'Link', onClick: onLinkClickMockFn },
      });
      const linkButton = screen.getByRole('button', { name: 'Link' });
      await userEvent.click(linkButton);
      expect(onLinkClickMockFn).toHaveBeenCalled();
    });
  });
});
