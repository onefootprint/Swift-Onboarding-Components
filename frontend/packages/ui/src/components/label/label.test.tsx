import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import Label, { LabelProps } from './label';

describe('<Label />', () => {
  const renderLabel = ({
    children = 'Lorem',
    htmlFor = 'ipsu',
    hasError = false,
    size = 'default',
  }: Partial<LabelProps>) =>
    customRender(
      <Label htmlFor={htmlFor} hasError={hasError} size={size}>
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
});
