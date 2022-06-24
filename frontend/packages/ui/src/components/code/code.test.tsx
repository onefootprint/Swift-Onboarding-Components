import React from 'react';
import {
  createClipboardSpy,
  customRender,
  screen,
  userEvent,
} from 'test-utils';

import ToastProvider from '../toast/toast-provider';
import Code, { CodeProps } from './code';

describe('<Code />', () => {
  const renderCode = ({
    buttonAriaLabel = 'Copy to clipboard',
    children = 'fp_xm7T6MqhfRBkxL0DPOpfwM4',
    testID,
    tooltipText = 'Copy to clipboard',
    tooltipTextConfirmation = 'Copied!',
  }: Partial<CodeProps>) =>
    customRender(
      <ToastProvider>
        <Code
          buttonAriaLabel={buttonAriaLabel}
          testID={testID}
          tooltipText={tooltipText}
          tooltipTextConfirmation={tooltipTextConfirmation}
        >
          {children}
        </Code>
      </ToastProvider>,
    );

  it('should assign a testID', () => {
    renderCode({ testID: 'code-test-id' });
    expect(screen.getByTestId('code-test-id')).toBeInTheDocument();
  });

  it('should show the text', () => {
    renderCode({ children: 'fp_xm7T6MqhfRBkxL0DPOpfwM4' });
    expect(screen.getByText('fp_xm7T6MqhfRBkxL0DPOpfwM4')).toBeInTheDocument();
  });

  describe('when hovering the button', () => {
    it('should show a tooltip', async () => {
      renderCode({
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
      renderCode({
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
});
