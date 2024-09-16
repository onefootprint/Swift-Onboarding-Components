import '../../config/initializers/i18next-test';

import { createClipboardSpy, customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';

import ToastProvider from '../toast/toast-provider';
import type { CodeInlineProps } from './code-inline';
import CodeInline from './code-inline';

describe('<CodeInline />', () => {
  const renderCodeInline = ({
    ariaLabel = 'Copy to clipboard',
    children = 'fp_xm7T6MqhfRBkxL0DPOpfwM4',
    tooltip = {
      position: 'top',
      text: 'Copy to clipboard',
      textConfirmation: 'Copied!',
    },
    disabled = false,
  }: Partial<CodeInlineProps>) =>
    customRender(
      <ToastProvider>
        <CodeInline ariaLabel={ariaLabel} disabled={disabled} tooltip={tooltip}>
          {children}
        </CodeInline>
      </ToastProvider>,
    );

  it('should show the text', () => {
    renderCodeInline({ children: 'fp_xm7T6MqhfRBkxL0DPOpfwM4' });
    expect(screen.getByText('fp_xm7T6MqhfRBkxL0DPOpfwM4')).toBeInTheDocument();
  });

  describe('when hovering the button on desktop', () => {
    it('should show a tooltip', async () => {
      renderCodeInline({
        children: 'fp_xm7T6MqhfRBkxL0DPOpfwM4',
        tooltip: {
          text: 'Copy to clipboard',
        },
        ariaLabel: 'Copy to clipboard',
      });
      const code = screen.getByRole('button', { name: 'Copy to clipboard' });
      expect(code).toBeInTheDocument();

      await userEvent.hover(code);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip', {
          name: 'Copy to clipboard',
        });
        expect(tooltip).toBeInTheDocument();
      });
    });
  });

  describe('when clicking on the button', () => {
    it('should copy the text to the clipboard and show a confirmation', async () => {
      const { writeTestMockFn } = createClipboardSpy();
      renderCodeInline({
        children: 'fp_xm7T6MqhfRBkxL0DPOpfwM4',
        ariaLabel: 'Copy to clipboard',
      });
      const code = screen.getByRole('button', { name: 'Copy to clipboard' });
      expect(code).toBeInTheDocument();

      await userEvent.click(code);

      await waitFor(() => {
        const confirmationTooltip = screen.getByRole('tooltip', {
          name: 'Copied!',
        });
        expect(confirmationTooltip).toBeInTheDocument();
      });
      expect(writeTestMockFn).toHaveBeenCalledWith('fp_xm7T6MqhfRBkxL0DPOpfwM4');
    });
  });

  describe('when disabledd', () => {
    it('should not show the button', async () => {
      renderCodeInline({
        children: 'fp_xm7T6MqhfRBkxL0DPOpfwM4',
        ariaLabel: 'Copy to clipboard',
        disabled: true,
      });
      const code = screen.queryByRole('button', { name: 'Copy to clipboard' });
      expect(code).not.toBeInTheDocument();
    });

    it('should not show the tooltip', async () => {
      renderCodeInline({
        children: 'fp_xm7T6MqhfRBkxL0DPOpfwM4',
        ariaLabel: 'Copy to clipboard',
        disabled: true,
      });
      const code = screen.getByText('fp_xm7T6MqhfRBkxL0DPOpfwM4');
      await userEvent.click(code);
      const tooltip = screen.queryByRole('tooltip', {
        name: 'Copy to clipboard',
      });
      expect(tooltip).not.toBeInTheDocument();
      expect(tooltip).not.toBeInTheDocument();
    });
  });
});
