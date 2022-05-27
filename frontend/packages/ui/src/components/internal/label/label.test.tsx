import React from 'react';
import { customRender, screen } from 'test-utils';

import Label, { LabelProps } from './label';

describe('<Label />', () => {
  const renderLabel = ({
    children = 'Lorem',
    htmlFor = 'ipsu',
  }: Partial<LabelProps>) =>
    customRender(<Label htmlFor={htmlFor}>{children}</Label>);

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
