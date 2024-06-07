import '../../config/initializers/i18next-test';

import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import React from 'react';

import type { LabelProps } from './label';
import Label from './label';

describe('<Label />', () => {
  const renderLabel = ({
    children = 'Lorem',
    htmlFor = 'ipsu',
    hasError = false,
    size = 'default',
    tooltip = undefined,
  }: Partial<LabelProps>) =>
    customRender(
      <Label htmlFor={htmlFor} hasError={hasError} size={size} tooltip={tooltip}>
        {children}
      </Label>,
    );

  it('should render the text', () => {
    renderLabel({ children: 'Lorem' });
    expect(screen.getByText('Lorem')).toBeInTheDocument();
  });

  it('should append the attribute for', () => {
    renderLabel({ children: 'Lorem', htmlFor: 'ipsum' });
    const label = screen.getByText('Lorem') as HTMLLabelElement;
    expect(label.getAttribute('for')).toEqual('ipsum');
  });

  it('should render tooltip', async () => {
    renderLabel({
      children: 'Lorem',
      htmlFor: 'ipsum',
      tooltip: {
        text: 'Additional detail',
        triggerAriaLabel: 'Detail tooltip',
      },
    });

    const tooltipIcon = screen.getByLabelText('Detail tooltip');
    await userEvent.hover(tooltipIcon);

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip', {
        name: 'Additional detail',
      });
      expect(tooltip).toBeInTheDocument();
    });
  });
});
