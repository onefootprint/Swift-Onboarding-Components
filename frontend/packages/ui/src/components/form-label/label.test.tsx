import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import FormLabel, { FormLabelProps } from './form-label';

describe('<FormLabel />', () => {
  const renderFormLabelLabel = ({
    children = 'Lorem',
    htmlFor = 'ipsu',
    hasError = false,
    size = 'default',
  }: Partial<FormLabelProps>) =>
    customRender(
      <FormLabel htmlFor={htmlFor} hasError={hasError} size={size}>
        {children}
      </FormLabel>,
    );

  it('should render the text', () => {
    renderFormLabelLabel({ children: 'Lorem' });
    expect(screen.getByText('Lorem')).toBeInTheDocument();
  });

  it('should append the attribute for', () => {
    renderFormLabelLabel({ children: 'Lorem', htmlFor: 'ipsum' });
    const label = screen.getByText('Lorem') as HTMLLabelElement;
    expect(label.getAttribute('for')).toEqual('ipsum');
  });
});
