import React from 'react';
import {
  createClipboardSpy,
  customRender,
  screen,
  userEvent,
} from 'test-utils';

import ToastProvider from '../toast/toast-provider';
import CodeInline, { CodeInlineProps } from './code-inline';

describe('<CodeInline />', () => {
  const renderCodeInline = ({
    buttonAriaLabel = 'Copy to clipboard',
    children = 'fp_xm7T6MqhfRBkxL0DPOpfwM4',
    testID,
    tooltipText = 'Copy to clipboard',
    tooltipTextConfirmation = 'Copied!',
    disable = false,
  }: Partial<CodeInlineProps>) =>
    customRender(
      <ToastProvider>
        <CodeInline
          buttonAriaLabel={buttonAriaLabel}
          disable={disable}
          testID={testID}
          tooltipText={tooltipText}
          tooltipTextConfirmation={tooltipTextConfirmation}
        >
          {children}
        </CodeInline>
      </ToastProvider>,
    );

  it('should assign a testID', () => {
    renderCodeInline({ testID: 'code-test-id' });
    expect(screen.getByTestId('code-test-id')).toBeInTheDocument();
  });

  it('should show the text', () => {
    renderCodeInline({ children: 'fp_xm7T6MqhfRBkxL0DPOpfwM4' });
    expect(screen.getByText('fp_xm7T6MqhfRBkxL0DPOpfwM4')).toBeInTheDocument();
  });

  describe('when hovering the button', () => {
    it('should show a tooltip', async () => {
      renderCodeInline({
        tooltipText: 'Copy to clipboard',
        buttonAriaLabel: 'Copy',
      });
      const code = screen.getByRole('button', { name: 'Copy' });
      await userEvent.hover(code);
      const tooltip = screen.getByRole('tooltip', {
        name: 'Copy to clipboard',
      });
      expect(tooltip).toBeInTheDocument();
    });
  });

  describe('when clicking on the button', () => {
    it('should copy the text to the clipboard and show a confirmation', async () => {
      const { writeTestMockFn } = createClipboardSpy();
      renderCodeInline({
        children: 'fp_xm7T6MqhfRBkxL0DPOpfwM4',
        tooltipText: 'Copy to clipboard',
        tooltipTextConfirmation: 'Copied!',
        buttonAriaLabel: 'Copy',
      });
      const code = screen.getByRole('button', { name: 'Copy' });
      await userEvent.click(code);
      await userEvent.hover(code);
      const confirmationTooltip = screen.getByRole('tooltip', {
        name: 'Copied!',
      });
      expect(confirmationTooltip).toBeInTheDocument();
      expect(writeTestMockFn).toHaveBeenCalledWith(
        'fp_xm7T6MqhfRBkxL0DPOpfwM4',
      );
    });
  });

  describe('when disabled', () => {
    it('should not show the button', async () => {
      renderCodeInline({
        children: 'fp_xm7T6MqhfRBkxL0DPOpfwM4',
        tooltipText: 'Copy to clipboard',
        buttonAriaLabel: 'Copy',
        disable: true,
      });
      const code = screen.queryByRole('button', { name: 'Copy' });
      expect(code).not.toBeInTheDocument();
    });

    it('should not show the tooltip', async () => {
      renderCodeInline({
        children: 'fp_xm7T6MqhfRBkxL0DPOpfwM4',
        tooltipText: 'Copy to clipboard',
        buttonAriaLabel: 'Copy',
        disable: true,
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
