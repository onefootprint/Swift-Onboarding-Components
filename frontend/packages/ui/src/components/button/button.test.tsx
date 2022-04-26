import React from 'react';
import { render, screen } from '@testing-library/react';

import Button from './button';

describe('<Button />', () => {
  it('should render', () => {
    render(<Button>Hello world</Button>);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });
});
