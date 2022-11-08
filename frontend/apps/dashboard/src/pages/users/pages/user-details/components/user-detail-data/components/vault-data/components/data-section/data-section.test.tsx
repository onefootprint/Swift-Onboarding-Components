import { IcoUserCircle24 } from '@onefootprint/icons';
import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import DataSection, { DataSectionProps } from './data-section';

describe('<DataSection />', () => {
  const renderDataSection = ({
    title = 'Lorem',
    children,
    renderCta,
    iconComponent = IcoUserCircle24,
  }: Partial<DataSectionProps>) =>
    customRender(
      <DataSection
        title={title}
        renderCta={renderCta}
        iconComponent={iconComponent}
      >
        {children}
      </DataSection>,
    );

  it('should render the title', () => {
    renderDataSection({ title: 'Identity data' });
    const title = screen.getByText('Identity data');
    expect(title).toBeInTheDocument();
  });

  it('should render the children', () => {
    renderDataSection({ children: 'Lorem ipsum' });
    const title = screen.getByText('Lorem ipsum');
    expect(title).toBeInTheDocument();
  });

  it('should render the cta', () => {
    const renderCta = () => 'Descrypt all';
    renderDataSection({ renderCta });
    const cta = screen.getByText('Descrypt all');
    expect(cta).toBeInTheDocument();
  });
});
