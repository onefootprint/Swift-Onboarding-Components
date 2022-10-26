import themes from '@onefootprint/design-tokens';
import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';

import Button from '../button';
import Tooltip, { TooltipProps } from './tooltip';

describe('<Tooltip />', () => {
  const renderTooltip = ({
    text = 'Tooltip text',
    'aria-label': ariaLabel,
    testID,
    size,
  }: Partial<TooltipProps>) =>
    customRender(
      <Tooltip aria-label={ariaLabel} testID={testID} size={size} text={text}>
        <Button>Hover me</Button>
      </Tooltip>,
    );

  it('should show/hide the tooltip when hovering/unhovering the trigger element', async () => {
    renderTooltip({});
    const trigger = screen.getByRole('button', { name: 'Hover me' });
    await userEvent.hover(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    await userEvent.unhover(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  describe('when the tooltip is visible', () => {
    it('should show the text of the tooltip', async () => {
      renderTooltip({ text: 'lorem' });
      const trigger = screen.getByRole('button', { name: 'Hover me' });
      await userEvent.hover(trigger);
      expect(screen.getByText('lorem')).toBeInTheDocument();
    });

    it('should add a test id attribute', async () => {
      renderTooltip({ testID: 'tooltip-test-id' });
      const trigger = screen.getByRole('button', { name: 'Hover me' });
      await userEvent.hover(trigger);
      expect(screen.getByTestId('tooltip-test-id')).toBeInTheDocument();
    });

    it('should add an aria label attribute', async () => {
      renderTooltip({ 'aria-label': 'tooltip aria label' });
      const trigger = screen.getByRole('button', { name: 'Hover me' });
      await userEvent.hover(trigger);
      expect(
        screen.getByRole('tooltip', { name: 'tooltip aria label' }),
      ).toBeInTheDocument();
    });
  });

  describe('size variants', () => {
    it('should render the right styles when it has the "default" size', async () => {
      renderTooltip({});
      const trigger = screen.getByRole('button', { name: 'Hover me' });
      await userEvent.hover(trigger);
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveStyle({
        'font-size': themes.light.typography['body-4'].fontSize,
      });
    });

    it('should render the right styles when it has the "compact" size', async () => {
      renderTooltip({ size: 'compact' });
      const trigger = screen.getByRole('button', { name: 'Hover me' });
      await userEvent.hover(trigger);
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveStyle({
        'font-size': themes.light.typography['caption-2'].fontSize,
      });
    });
  });
});
