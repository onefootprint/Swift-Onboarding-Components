import React from 'react';
import { render, screen } from '@testing-library/react';

import Button from './Button';

describe('<Button />', () => {
  it('should render', () => {
    render(<Button>Hello world1</Button>);
    expect(screen.getByText('Hello world1')).toBeInTheDocument();
  });
});
