import React from 'react';
import { customRender, screen } from 'test-utils';

import Code, { CodeProps } from './code';

describe('<Code />', () => {
  const renderCode = ({
    children = 'fp_xm7T6MqhfRBkxL0DPOpfwM4',
    testID,
  }: Partial<CodeProps>) =>
    customRender(<Code testID={testID}>{children}</Code>);

  it('should assign a testID', () => {
    renderCode({ testID: 'code-test-id' });
    expect(screen.getByTestId('code-test-id')).toBeInTheDocument();
  });

  it('should render the text', () => {
    renderCode({ children: 'fp_xm7T6MqhfRBkxL0DPOpfwM4' });
    expect(screen.getByText('fp_xm7T6MqhfRBkxL0DPOpfwM4')).toBeInTheDocument();
  });
});
