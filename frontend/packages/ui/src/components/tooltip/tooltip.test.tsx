import '../../config/initializers/i18next-test';

import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import React from 'react';

import Button from '../button';
import type { TooltipProps } from './tooltip';
import Tooltip from './tooltip';

describe('<Tooltip />', () => {
  const renderTooltip = ({ text = 'Tooltip text' }: Partial<TooltipProps>) =>
    customRender(
      <Tooltip text={text}>
        <Button>Hover me</Button>
      </Tooltip>,
    );

  it('should show/hide the tooltip when hovering/unhovering the trigger element', async () => {
    renderTooltip({});
    const trigger = screen.getByRole('button', { name: 'Hover me' });
    expect(trigger).toBeInTheDocument();

    await userEvent.hover(trigger);
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip', {
        name: 'Tooltip text',
      });
      expect(tooltip).toBeInTheDocument();
    });

    await userEvent.unhover(trigger);

    await waitFor(() => {
      const tooltip = screen.queryByRole('tooltip', {
        name: 'Tooltip text',
      });
      expect(tooltip).toBeNull();
    });
  });
});
