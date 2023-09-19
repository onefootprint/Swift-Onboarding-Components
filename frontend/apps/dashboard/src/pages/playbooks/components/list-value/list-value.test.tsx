import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import ListValue from './list-value';

describe('<ListValue />', () => {
  it('should render the IcoCloseSmall24 icon when value array is empty', () => {
    customRender(<ListValue value={[]} />);
    expect(screen.getByTestId('no-value-icon')).toBeInTheDocument();
  });

  it('should render the values joined by a comma when length is less than or equal to threshold', () => {
    const values = ['one', 'two', 'three'];
    customRender(<ListValue value={values} />);
    expect(screen.getByText(values.join(', '))).toBeInTheDocument();
  });

  it('should render the first "threshold" number of values and a tooltip with the remaining values when length is greater than threshold', () => {
    const values = ['one', 'two', 'three', 'four', 'five'];
    customRender(<ListValue value={values} threshold={3} />);
    expect(screen.getByText('one, two, three')).toBeInTheDocument();
    expect(screen.getByText('and')).toBeInTheDocument();
    expect(screen.getByText('2 more')).toBeInTheDocument();
  });
});
