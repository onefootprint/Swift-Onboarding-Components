import {
  createClipboardSpy,
  customRender,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';

import ToastProvider from '../toast/toast-provider';
import CodeBlock, { CodeBlockProps } from './code-block';

const content = `<div id="footprint-button"/>`;

describe('<CodeBlock />', () => {
  const renderCode = ({
    buttonAriaLabel = 'Copy to clipboard',
    children = content,
    testID,
    language = 'html',
    tooltipText = 'Copy to clipboard',
    tooltipTextConfirmation = 'Copied!',
  }: Partial<CodeBlockProps>) =>
    customRender(
      <ToastProvider>
        <CodeBlock
          language={language}
          buttonAriaLabel={buttonAriaLabel}
          testID={testID}
          tooltipText={tooltipText}
          tooltipTextConfirmation={tooltipTextConfirmation}
        >
          {children}
        </CodeBlock>
      </ToastProvider>,
    );

  it('should assign a testID', () => {
    renderCode({ testID: 'code-test-id' });
    expect(screen.getByTestId('code-test-id')).toBeInTheDocument();
  });

  describe('when hovering the button', () => {
    it('should show a tooltip', async () => {
      renderCode({
        tooltipText: 'Copy to clipboard',
        buttonAriaLabel: 'Copy',
      });
      const copyButton = screen.getByRole('button', { name: 'Copy' });
      expect(copyButton).toBeInTheDocument();

      await userEvent.hover(copyButton);

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
      renderCode({
        children: content,
        tooltipText: 'Copy to clipboard',
        tooltipTextConfirmation: 'Copied!',
        buttonAriaLabel: 'Copy',
      });
      const copyButton = screen.getByRole('button', { name: 'Copy' });
      expect(copyButton).toBeInTheDocument();

      await userEvent.click(copyButton);

      await waitFor(() => {
        const confirmationTooltip = screen.getByRole('tooltip', {
          name: 'Copied!',
        });
        expect(confirmationTooltip).toBeInTheDocument();
      });
      expect(writeTestMockFn).toHaveBeenCalledWith(content);
    });
  });
});
