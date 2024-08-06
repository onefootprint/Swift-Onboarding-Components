import '../../config/initializers/i18next-test';

import { customRender, screen, userEvent } from '@onefootprint/test-utils';

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
  }: Partial<DrawerProps>) =>
    customRender(
      <Drawer
        closeAriaLabel={closeAriaLabel}
        closeIconComponent={closeIconComponent}
        onClose={onClose}
        open={open}
        title={title}
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
  });
});
