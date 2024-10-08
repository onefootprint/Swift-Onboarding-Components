import '../../config/initializers/i18next-test';

import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';

import type { BottomSheetProps } from './bottom-sheet';
import BottomSheet from './bottom-sheet';

describe('<BottomSheet />', () => {
  const renderBottomSheet = ({
    open = true,
    onClose = () => undefined,
    title: headerTitle = 'title',
    children = 'content',
  }: Partial<BottomSheetProps>) =>
    customRender(
      <BottomSheet open={open} onClose={onClose} title={headerTitle}>
        {children}
      </BottomSheet>,
    );

  describe('when the prop open is true', () => {
    it('should show the bottom sheet', async () => {
      renderBottomSheet({ open: true });
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('when the bottom sheet is open', () => {
    it('should show the title text', async () => {
      renderBottomSheet({ open: true, title: 'header' });
      await waitFor(() => {
        expect(screen.getByText('header')).toBeInTheDocument();
      });
    });

    it('should trigger onClose when clicking on the close button', async () => {
      const onCloseMockFn = jest.fn();
      renderBottomSheet({
        open: true,
        closeAriaLabel: 'Close',
        onClose: onCloseMockFn,
      });

      let closeButton;
      await waitFor(() => {
        closeButton = screen.getByRole('button', { name: 'Close' });
        expect(closeButton).toBeInTheDocument();
      });
      if (closeButton) {
        await userEvent.click(closeButton);
      }
      expect(onCloseMockFn).toHaveBeenCalled();
    });

    it('should show the content', async () => {
      renderBottomSheet({ open: true, children: 'content' });
      await waitFor(() => {
        expect(screen.getByText('content')).toBeInTheDocument();
      });
    });
  });
});
