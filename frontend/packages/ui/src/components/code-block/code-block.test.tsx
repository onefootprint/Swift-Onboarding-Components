import {
  createClipboardSpy,
  customRender,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';

import ToastProvider from '../toast/toast-provider';
import type { CodeBlockProps } from './code-block';
import CodeBlock from './code-block';

const content = `<div id="footprint-button"/>`;

describe('<CodeBlock />', () => {
  const renderCode = ({
    ariaLabel = 'Copy to clipboard',
    children = content,
    language = 'html',
    tooltipText = 'Copy to clipboard',
    tooltipTextConfirmation = 'Copied!',
  }: Partial<CodeBlockProps>) =>
    customRender(
      <ToastProvider>
        <CodeBlock
          language={language}
          ariaLabel={ariaLabel}
          tooltipText={tooltipText}
          tooltipTextConfirmation={tooltipTextConfirmation}
        >
          {children}
        </CodeBlock>
      </ToastProvider>,
    );

  describe('when hovering the button', () => {
    it('should show a tooltip', async () => {
      renderCode({
        tooltipText: 'Copy to clipboard',
        ariaLabel: 'Copy to clipboard',
      });
      const copyButton = screen.getByRole('button', {
        name: 'Copy to clipboard',
      });
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
        ariaLabel: 'Copy to clipboard',
      });
      const copyButton = screen.getByRole('button', {
        name: 'Copy to clipboard',
      });
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
