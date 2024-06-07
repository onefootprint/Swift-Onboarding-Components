import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';

import type { FieldsetProps } from './fieldset';
import Fieldset from './fieldset';

describe('<Fieldset />', () => {
  const renderFieldset = ({ title = 'title', children = 'children', cta }: Partial<FieldsetProps>) => {
    customRender(
      <Fieldset title={title} cta={cta}>
        {children}
      </Fieldset>,
    );
  };

  it('should render the title', () => {
    renderFieldset({ title: 'Title' });

    expect(screen.getByText('Title')).toBeInTheDocument();
  });

  it('should render the children', () => {
    renderFieldset({ children: 'Children' });

    expect(screen.getByText('Children')).toBeInTheDocument();
  });

  it('should render the cta', async () => {
    const onClick = jest.fn();
    renderFieldset({ cta: { label: 'Edit', onClick } });

    const cta = screen.getByRole('button', { name: 'Edit' });
    expect(cta).toBeInTheDocument();

    await userEvent.click(cta);
    expect(onClick).toHaveBeenCalled();
  });
});
